package edu.columbia.corefellowship.applications.controller;

import edu.columbia.corefellowship.applications.dto.CreateStartupRequest;
import edu.columbia.corefellowship.applications.model.Startup;
import edu.columbia.corefellowship.applications.repository.StartupRepository;
import edu.columbia.corefellowship.applications.util.TermValidator;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/startups")
public class StartupController {

  private final StartupRepository repository;

  public StartupController(StartupRepository repository) {
    this.repository = repository;
  }

  @PostMapping("/intake")
  public ResponseEntity<Startup> createStartup(
      @Valid @RequestBody CreateStartupRequest request,
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-User-Email", required = false) String authenticatedEmail) {

    // Validate that userId is present (user is authenticated)
    if (userId == null || userId.isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User ID is required");
    }

    TermValidator.validate(request.getTerm());

    // Validate that request email matches authenticated email
    if (authenticatedEmail != null && !request.getContactEmail().equalsIgnoreCase(authenticatedEmail)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "Contact email must match your account email");
    }

    // Check if user already has a startup submission for this cohort
    List<Startup> existingStartups = repository.findByUserIdAndTerm(userId, request.getTerm());
    if (!existingStartups.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "You have already submitted a startup intake form for this term");
    }

    Startup startup = new Startup();

    // Set userId from authenticated user
    startup.setUserId(userId);
    startup.setTerm(request.getTerm());

    // Company Info
    startup.setCompanyName(request.getCompanyName());
    startup.setWebsite(request.getWebsite());
    startup.setIndustry(request.getIndustry());
    startup.setDescription(request.getDescription());
    startup.setStage(request.getStage());
    startup.setTeamSize(request.getTeamSize());
    startup.setFoundedYear(request.getFoundedYear());

    // Contact Info
    startup.setContactName(request.getContactName());
    startup.setContactTitle(request.getContactTitle());
    startup.setContactEmail(request.getContactEmail());
    startup.setContactPhone(request.getContactPhone());

    // Operating Details
    startup.setOperatingMode(request.getOperatingMode());
    startup.setTimeZone(request.getTimeZone());

    // Internship Details
    startup.setInternsSupervisor(request.getInternsSupervisor());
    startup.setHasHiredInternsPreviously(request.getHasHiredInternsPreviously());
    startup.setNumberOfInternsNeeded(request.getNumberOfInternsNeeded());
    startup.setPositions(request.getPositions());
    startup.setWillPayInterns(request.getWillPayInterns());
    startup.setPayAmount(request.getPayAmount());
    startup.setLookingForPermanentIntern(request.getLookingForPermanentIntern());
    startup.setProjectDescriptionUrl(request.getProjectDescriptionUrl());

    // Discovery
    startup.setReferralSource(request.getReferralSource());

    // Commitment
    startup.setCommitmentAcknowledged(request.getCommitmentAcknowledged());

    // Set defaults (admin fields)
    startup.setStatus("submitted");
    startup.setSubmittedAt(Instant.now());
    startup.setUpdatedAt(Instant.now());

    Startup saved = repository.save(startup);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }

  @GetMapping("/available")
  public ResponseEntity<List<Map<String, Object>>> getAvailableStartups(
      @RequestParam String term) {
    TermValidator.validate(term);
    // Returns only approved startups for the given term with student-safe fields only
    List<Startup> approved = repository.findByTermAndStatus(term, "approved");
    List<Map<String, Object>> result = new ArrayList<>();

    for (Startup s : approved) {
      Map<String, Object> safe = new HashMap<>();
      safe.put("id", s.getId());
      safe.put("companyName", s.getCompanyName());
      safe.put("website", s.getWebsite());
      safe.put("industry", s.getIndustry());
      safe.put("description", s.getDescription());
      safe.put("stage", s.getStage());
      safe.put("teamSize", s.getTeamSize());
      safe.put("foundedYear", s.getFoundedYear());
      safe.put("operatingMode", s.getOperatingMode());
      safe.put("timeZone", s.getTimeZone());
      safe.put("numberOfInternsNeeded", s.getNumberOfInternsNeeded());
      safe.put("positions", s.getPositions());
      safe.put("willPayInterns", s.getWillPayInterns());
      safe.put("payAmount", s.getPayAmount());
      result.add(safe);
    }

    return ResponseEntity.ok(result);
  }

  @GetMapping
  public ResponseEntity<List<Startup>> getStartups(
      @RequestParam(required = false) String term,
      @RequestParam(required = false) String status,
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-User-Role", required = false) String userRole) {

    List<Startup> startups;

    // Admins can see all startups
    if ("ROLE_ADMIN".equals(userRole)) {
      if (term == null || term.isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "term is required for admin queries");
      }
      if (status != null && !status.isBlank()) {
        startups = repository.findByTermAndStatus(term, status);
      } else {
        startups = repository.findByTerm(term);
      }
    } else {
      // Regular users can only see their own startups
      if (userId == null || userId.isBlank()) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User ID is required");
      }
      startups = repository.findByUserId(userId);
    }

    return ResponseEntity.ok(startups);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Startup> getStartup(
      @PathVariable String id,
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-User-Role", required = false) String userRole) {

    return repository.findById(id)
        .map(startup -> {
          // Admins can view any startup
          if ("ROLE_ADMIN".equals(userRole)) {
            return ResponseEntity.ok(startup);
          }

          // Regular users can only view their own startups
          if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User ID is required");
          }

          if (!startup.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "You can only view your own startup submissions");
          }

          return ResponseEntity.ok(startup);
        })
        .orElse(ResponseEntity.notFound().build());
  }

  @PatchMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Startup> updateStartupStatus(
      @PathVariable String id,
      @RequestBody Map<String, String> updates) {

    return repository.findById(id)
        .map(startup -> {
          if (updates.containsKey("status")) {
            startup.setStatus(updates.get("status"));
          }
          if (updates.containsKey("reviewedBy")) {
            startup.setReviewedBy(updates.get("reviewedBy"));
          }
          if (updates.containsKey("reviewNotes")) {
            startup.setReviewNotes(updates.get("reviewNotes"));
          }

          startup.setUpdatedAt(Instant.now());
          Startup updated = repository.save(startup);
          return ResponseEntity.ok(updated);
        })
        .orElse(ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Map<String, String>> deleteStartup(@PathVariable String id) {
    if (!repository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }

    repository.deleteById(id);
    return ResponseEntity.ok(Map.of("message", "Startup deleted successfully"));
  }
}
