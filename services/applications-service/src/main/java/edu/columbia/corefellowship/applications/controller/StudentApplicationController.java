package edu.columbia.corefellowship.applications.controller;

import edu.columbia.corefellowship.applications.dto.CreateStudentApplicationRequest;
import edu.columbia.corefellowship.applications.dto.UpdateApplicationStatusRequest;
import edu.columbia.corefellowship.applications.model.StudentApplication;
import edu.columbia.corefellowship.applications.repository.StudentApplicationRepository;
import edu.columbia.corefellowship.applications.service.StorageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/students/applications")
public class StudentApplicationController {

  private final StudentApplicationRepository repository;
  private final StorageService storageService;

  public StudentApplicationController(
      StudentApplicationRepository repository,
      StorageService storageService) {
    this.repository = repository;
    this.storageService = storageService;
  }

  @PostMapping
  public ResponseEntity<StudentApplication> createApplication(
      @Valid @RequestBody CreateStudentApplicationRequest request,
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-User-Email", required = false) String authenticatedEmail) {

    // Validate that userId is present (user is authenticated)
    if (userId == null || userId.isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User ID is required");
    }

    // Validate that request email matches authenticated email
    if (authenticatedEmail != null && !request.getEmail().equalsIgnoreCase(authenticatedEmail)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "Email must match your account email");
    }

    // Check if user already has an application (one application per user)
    List<StudentApplication> existingApplications = repository.findByUserId(userId);
    if (!existingApplications.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "You have already submitted an application");
    }

    StudentApplication application = new StudentApplication();

    // Set userId from authenticated user
    application.setUserId(userId);

    // Personal Information
    application.setFullName(request.getFullName());
    application.setPronouns(request.getPronouns());
    application.setGradYear(request.getGradYear());
    application.setSchool(request.getSchool());
    application.setMajor(request.getMajor());
    application.setEmail(request.getEmail());
    application.setLinkedinProfile(request.getLinkedinProfile());
    application.setPortfolioWebsite(request.getPortfolioWebsite());
    application.setResumeUrl(request.getResumeUrl());

    // Discovery
    application.setHowDidYouHear(request.getHowDidYouHear());
    application.setReferralSource(request.getReferralSource());

    // Role Preferences
    application.setRolePreferences(request.getRolePreferences());

    // Short Answer Questions
    application.setVideoSubmissionUrl(request.getVideoSubmissionUrl());
    application.setIndustriesOfInterest(request.getIndustriesOfInterest());
    application.setProjectExperience(request.getProjectExperience());

    // Miscellaneous
    application.setAdditionalComments(request.getAdditionalComments());
    application.setPreviouslyApplied(request.getPreviouslyApplied());
    application.setPreviouslyParticipated(request.getPreviouslyParticipated());
    application.setHasUpcomingInternshipOffers(request.getHasUpcomingInternshipOffers());

    // Set defaults (admin fields)
    application.setStatus("submitted");
    application.setSubmittedAt(Instant.now());
    application.setUpdatedAt(Instant.now());

    StudentApplication saved = repository.save(application);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }

  @GetMapping
  public ResponseEntity<List<StudentApplication>> getApplications(
      @RequestParam(required = false) String term,
      @RequestParam(required = false) String status,
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-User-Role", required = false) String userRole) {

    List<StudentApplication> applications;

    // Admins can see all applications
    if ("ROLE_ADMIN".equals(userRole)) {
      if (term != null && status != null) {
        applications = repository.findByTermAndStatus(term, status);
      } else if (term != null) {
        applications = repository.findByTerm(term);
      } else if (status != null) {
        applications = repository.findByStatus(status);
      } else {
        applications = repository.findAll();
      }
    } else {
      // Regular users can only see their own applications
      if (userId == null || userId.isBlank()) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User ID is required");
      }
      applications = repository.findByUserId(userId);
    }

    return ResponseEntity.ok(applications);
  }

  @GetMapping("/{id}")
  public ResponseEntity<StudentApplication> getApplication(
      @PathVariable String id,
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-User-Role", required = false) String userRole) {

    return repository.findById(id)
        .map(application -> {
          // Admins can view any application
          if ("ROLE_ADMIN".equals(userRole)) {
            return ResponseEntity.ok(application);
          }

          // Regular users can only view their own applications
          if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User ID is required");
          }

          if (!application.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "You can only view your own applications");
          }

          return ResponseEntity.ok(application);
        })
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping("/{id}/resume")
  public ResponseEntity<Map<String, String>> uploadResume(
      @PathVariable String id,
      @RequestParam("file") MultipartFile file,
      @RequestHeader(value = "X-User-Id", required = false) String userId) {

    // Validate user is authenticated
    if (userId == null || userId.isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User ID is required");
    }

    // Find the application
    StudentApplication application = repository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "Application not found"));

    // Verify user owns this application
    if (!application.getUserId().equals(userId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "You can only upload resume for your own application");
    }

    // Generate unique filename: resume-{userId}-{timestamp}.pdf
    String fileName = String.format("resume-%s-%d.pdf", userId, System.currentTimeMillis());

    // Upload file to GCS
    String blobName = storageService.uploadFile(file, userId, fileName);

    // Update application with GCS blob name
    application.setResumeUrl(blobName);
    application.setUpdatedAt(Instant.now());
    repository.save(application);

    // Return the blob name
    return ResponseEntity.ok(Map.of(
        "message", "Resume uploaded successfully",
        "resumeUrl", blobName
    ));
  }

  @GetMapping("/{id}/resume")
  public ResponseEntity<Map<String, String>> getResumeUrl(
      @PathVariable String id,
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-User-Role", required = false) String userRole) {

    // Find the application
    StudentApplication application = repository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "Application not found"));

    // Verify access: user owns application OR user is admin
    boolean isOwner = userId != null && application.getUserId().equals(userId);
    boolean isAdmin = "ROLE_ADMIN".equals(userRole);

    if (!isOwner && !isAdmin) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "You can only access your own resume");
    }

    // Check if resume exists
    if (application.getResumeUrl() == null || application.getResumeUrl().isBlank()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND,
          "No resume uploaded for this application");
    }

    // Generate signed URL (valid for 15 minutes)
    String signedUrl = storageService.getSignedUrl(application.getResumeUrl());

    return ResponseEntity.ok(Map.of(
        "signedUrl", signedUrl,
        "expiresIn", "15 minutes"
    ));
  }

  @PatchMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<StudentApplication> updateApplicationStatus(
      @PathVariable String id,
      @Valid @RequestBody UpdateApplicationStatusRequest request) {

    return repository.findById(id)
        .map(application -> {
          application.setStatus(request.getStatus());
          application.setUpdatedAt(Instant.now());

          if (request.getReviewedBy() != null) {
            application.setReviewedBy(request.getReviewedBy());
          }
          if (request.getReviewNotes() != null) {
            application.setReviewNotes(request.getReviewNotes());
          }

          StudentApplication updated = repository.save(application);
          return ResponseEntity.ok(updated);
        })
        .orElse(ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Map<String, String>> deleteApplication(@PathVariable String id) {
    if (!repository.existsById(id)) {
      return ResponseEntity.notFound().build();
    }

    repository.deleteById(id);
    return ResponseEntity.ok(Map.of("message", "Application deleted successfully"));
  }
}
