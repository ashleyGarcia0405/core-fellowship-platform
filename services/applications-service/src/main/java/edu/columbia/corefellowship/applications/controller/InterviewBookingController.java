package edu.columbia.corefellowship.applications.controller;

import edu.columbia.corefellowship.applications.dto.UpdateInterviewBookingRequest;
import edu.columbia.corefellowship.applications.model.InterviewBooking;
import edu.columbia.corefellowship.applications.model.InterviewerAssignment;
import edu.columbia.corefellowship.applications.model.StudentApplication;
import edu.columbia.corefellowship.applications.repository.InterviewBookingRepository;
import edu.columbia.corefellowship.applications.repository.StudentApplicationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class InterviewBookingController {

  private final InterviewBookingRepository bookingRepository;
  private final StudentApplicationRepository applicationRepository;

  @Value("${cal.webhook.secret:}")
  private String calWebhookSecret;

  @Value("${app.active-term:Summer 2026}")
  private String activeTerm;

  public InterviewBookingController(
      InterviewBookingRepository bookingRepository,
      StudentApplicationRepository applicationRepository) {
    this.bookingRepository = bookingRepository;
    this.applicationRepository = applicationRepository;
  }

  @GetMapping("/v1/admin/interviews")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<List<InterviewBooking>> listBookings(
      @RequestParam String term) {
    return ResponseEntity.ok(bookingRepository.findByTerm(term));
  }

  @GetMapping("/v1/students/interviews")
  public ResponseEntity<List<InterviewBooking>> listStudentBookings(
      @RequestHeader(value = "X-User-Email", required = false) String userEmail,
      @RequestHeader(value = "X-User-Id", required = false) String userId) {
    String resolvedEmail = userEmail;
    if (resolvedEmail == null || resolvedEmail.isBlank()) {
      if (userId == null || userId.isBlank()) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User identity is required");
      }
      List<StudentApplication> apps = applicationRepository.findByUserId(userId);
      if (!apps.isEmpty()) {
        resolvedEmail = apps.get(0).getEmail();
      }
    }

    if (resolvedEmail == null || resolvedEmail.isBlank()) {
      return ResponseEntity.ok(List.of());
    }

    return ResponseEntity.ok(bookingRepository.findByStudentEmail(resolvedEmail));
  }

  @PatchMapping("/v1/admin/interviews/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<InterviewBooking> updateBooking(
      @PathVariable String id,
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-User-Email", required = false) String userEmail,
      @RequestBody UpdateInterviewBookingRequest request) {

    if (userId == null || userId.isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User ID is required");
    }

    InterviewBooking booking = bookingRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interview booking not found"));

    if (Boolean.TRUE.equals(request.getRemoveInterviewer())) {
      boolean removed = booking.getInterviewers().removeIf(i -> userId.equals(i.getUserId()));
      if (removed) {
        booking.setUpdatedAt(Instant.now());
      }
    }

    if (Boolean.TRUE.equals(request.getAddInterviewer())) {
      if (booking.getInterviewers().stream().anyMatch(i -> userId.equals(i.getUserId()))) {
        return ResponseEntity.ok(booking);
      }
      if (booking.getInterviewers().size() >= 2) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Interview already has maximum interviewers");
      }
      InterviewerAssignment assignment = new InterviewerAssignment();
      assignment.setUserId(userId);
      assignment.setEmail(userEmail);
      assignment.setName(userEmail != null ? userEmail.split("@")[0] : "Admin");
      assignment.setAssignedAt(Instant.now());
      booking.getInterviewers().add(assignment);
      booking.setUpdatedAt(Instant.now());
    }

    InterviewBooking updated = bookingRepository.save(booking);
    return ResponseEntity.ok(updated);
  }

  @PostMapping("/v1/webhooks/cal")
  public ResponseEntity<Map<String, String>> handleCalWebhook(
      @RequestHeader(value = "X-Cal-Webhook-Secret", required = false) String secret,
      @RequestParam(value = "term", required = false) String termParam,
      @RequestBody Map<String, Object> body) {

    if (calWebhookSecret != null && !calWebhookSecret.isBlank()) {
      if (secret == null || !calWebhookSecret.equals(secret)) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid webhook secret");
      }
    }

    String trigger = getString(body, "triggerEvent");
    Map<String, Object> payload = getMap(body, "payload");
    if (payload == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing payload");
    }

    // When a booking is rescheduled, cal.com sends the old UID in rescheduleUid.
    // Cancel the old record so it doesn't appear as a ghost slot.
    if ("BOOKING_RESCHEDULED".equalsIgnoreCase(trigger)) {
      String rescheduleUid = getString(payload, "rescheduleUid");
      if (rescheduleUid != null && !rescheduleUid.isBlank()) {
        bookingRepository.findByCalBookingUid(rescheduleUid).ifPresent(old -> {
          old.setStatus("cancelled");
          old.setUpdatedAt(Instant.now());
          bookingRepository.save(old);
        });
      }
    }

    String bookingUid = getString(payload, "uid");
    if (bookingUid == null || bookingUid.isBlank()) {
      bookingUid = getString(payload, "id");
    }

    InterviewBooking booking = bookingUid != null
        ? bookingRepository.findByCalBookingUid(bookingUid).orElseGet(InterviewBooking::new)
        : new InterviewBooking();

    if (bookingUid != null) {
      booking.setCalBookingUid(bookingUid);
    }

    booking.setTitle(getString(payload, "title"));
    String eventType = getString(payload, "type");
    if (eventType == null || eventType.isBlank()) {
      eventType = getString(payload, "eventTypeSlug");
    }
    booking.setEventType(eventType);

    String startTime = getString(payload, "startTime");
    String endTime = getString(payload, "endTime");
    if (startTime != null) {
      booking.setStartTime(Instant.parse(startTime));
    }
    if (endTime != null) {
      booking.setEndTime(Instant.parse(endTime));
    }

    String studentEmail = extractAttendeeEmail(payload);
    String studentName = extractAttendeeName(payload);
    if (studentEmail != null) {
      booking.setStudentEmail(studentEmail);
    }
    if (studentName != null) {
      booking.setStudentName(studentName);
    }

    booking.setInterviewType(resolveInterviewType(booking.getEventType(), booking.getTitle()));

    String payloadStatus = getString(payload, "status");
    if ("BOOKING_CANCELLED".equalsIgnoreCase(trigger) || "CANCELLED".equalsIgnoreCase(payloadStatus)) {
      booking.setStatus("cancelled");
    } else {
      booking.setStatus("scheduled");
    }

    if (booking.getCreatedAt() == null) {
      booking.setCreatedAt(Instant.now());
    }
    booking.setUpdatedAt(Instant.now());

    if (booking.getApplicationId() == null && booking.getStudentEmail() != null) {
      List<StudentApplication> apps = applicationRepository.findByEmail(booking.getStudentEmail());
      if (!apps.isEmpty()) {
        StudentApplication app = apps.get(0);
        booking.setApplicationId(app.getId());
        if (booking.getTerm() == null && app.getTerm() != null) {
          booking.setTerm(app.getTerm());
        }
      }
    }

    if (termParam != null && !termParam.isBlank()) {
      booking.setTerm(termParam);
    } else if (booking.getTerm() == null) {
      booking.setTerm(activeTerm);
    }

    bookingRepository.save(booking);
    return ResponseEntity.ok(Map.of("status", "ok"));
  }

  private Map<String, Object> getMap(Map<String, Object> body, String key) {
    Object value = body.get(key);
    if (value instanceof Map<?, ?> map) {
      return (Map<String, Object>) map;
    }
    return null;
  }

  private String getString(Map<String, Object> body, String key) {
    Object value = body.get(key);
    if (value instanceof String string) {
      return string;
    }
    return null;
  }

  private String extractAttendeeEmail(Map<String, Object> payload) {
    String responseEmail = extractResponseValue(payload, "email");
    if (responseEmail != null) {
      return responseEmail;
    }
    Object attendees = payload.get("attendees");
    if (attendees instanceof List<?> list && !list.isEmpty()) {
      Object first = list.get(0);
      if (first instanceof Map<?, ?> map) {
        Object email = map.get("email");
        if (email instanceof String s) {
          return s;
        }
      }
    }
    return getString(payload, "email");
  }

  private String extractAttendeeName(Map<String, Object> payload) {
    String responseName = extractResponseValue(payload, "name");
    if (responseName != null) {
      return responseName;
    }
    Object attendees = payload.get("attendees");
    if (attendees instanceof List<?> list && !list.isEmpty()) {
      Object first = list.get(0);
      if (first instanceof Map<?, ?> map) {
        Object name = map.get("name");
        if (name instanceof String s) {
          return s;
        }
      }
    }
    return getString(payload, "name");
  }

  private String extractResponseValue(Map<String, Object> payload, String key) {
    Object responses = payload.get("responses");
    if (responses instanceof Map<?, ?> map) {
      Object entry = map.get(key);
      if (entry instanceof Map<?, ?> entryMap) {
        Object value = entryMap.get("value");
        if (value instanceof String s) {
          return s;
        }
      }
    }
    return null;
  }

  private String resolveInterviewType(String eventType, String title) {
    String haystack = (eventType != null ? eventType : "") + " " + (title != null ? title : "");
    String normalized = haystack.toLowerCase();
    if (normalized.contains("non-technical") || normalized.contains("non technical")) {
      return "non-technical";
    }
    if (normalized.contains("technical")) {
      return "technical";
    }
    return "non-technical";
  }
}
