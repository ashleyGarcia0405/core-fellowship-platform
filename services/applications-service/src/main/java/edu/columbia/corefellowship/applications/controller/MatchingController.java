package edu.columbia.corefellowship.applications.controller;

import edu.columbia.corefellowship.applications.model.AiRecommendation;
import edu.columbia.corefellowship.applications.model.Interview;
import edu.columbia.corefellowship.applications.model.MatchPreference;
import edu.columbia.corefellowship.applications.model.MatchPreference.RoleReference;
import edu.columbia.corefellowship.applications.model.Startup;
import edu.columbia.corefellowship.applications.model.StudentApplication;
import edu.columbia.corefellowship.applications.repository.AiRecommendationRepository;
import edu.columbia.corefellowship.applications.repository.InterviewRepository;
import edu.columbia.corefellowship.applications.repository.MatchPreferenceRepository;
import edu.columbia.corefellowship.applications.repository.StartupRepository;
import edu.columbia.corefellowship.applications.repository.StudentApplicationRepository;
import edu.columbia.corefellowship.applications.service.OpenAiService;
import edu.columbia.corefellowship.applications.service.PdfTextExtractor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/admin/matching")
@PreAuthorize("hasRole('ADMIN')")
public class MatchingController {

  private final MatchPreferenceRepository matchPreferenceRepository;
  private final AiRecommendationRepository aiRecommendationRepository;
  private final StudentApplicationRepository studentApplicationRepository;
  private final InterviewRepository interviewRepository;
  private final StartupRepository startupRepository;
  private final OpenAiService openAiService;
  private final PdfTextExtractor pdfTextExtractor;

  public MatchingController(
      MatchPreferenceRepository matchPreferenceRepository,
      AiRecommendationRepository aiRecommendationRepository,
      StudentApplicationRepository studentApplicationRepository,
      InterviewRepository interviewRepository,
      StartupRepository startupRepository,
      OpenAiService openAiService,
      PdfTextExtractor pdfTextExtractor) {
    this.matchPreferenceRepository = matchPreferenceRepository;
    this.aiRecommendationRepository = aiRecommendationRepository;
    this.studentApplicationRepository = studentApplicationRepository;
    this.interviewRepository = interviewRepository;
    this.startupRepository = startupRepository;
    this.openAiService = openAiService;
    this.pdfTextExtractor = pdfTextExtractor;
  }

  @GetMapping("/preferences")
  public ResponseEntity<List<MatchPreference>> getAllSubmittedPreferences(@RequestParam String term) {
    if (term == null || term.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "term is required");
    }

    Set<String> applicationIdsForTerm = studentApplicationRepository.findByTerm(term).stream()
        .map(StudentApplication::getId)
        .collect(Collectors.toSet());

    Map<String, String> applicationNameById = studentApplicationRepository.findByTerm(term).stream()
        .collect(Collectors.toMap(StudentApplication::getId, app -> {
          String fullName = app.getFullName();
          return fullName == null ? "" : fullName;
        }));

    List<MatchPreference> preferences = matchPreferenceRepository.findBySubmitted(true).stream()
        .filter(pref -> applicationIdsForTerm.contains(pref.getApplicationId()))
        .sorted(Comparator
            .comparing((MatchPreference pref) -> applicationNameById.getOrDefault(pref.getApplicationId(), ""),
                String.CASE_INSENSITIVE_ORDER)
            .thenComparing(MatchPreference::getApplicationId))
        .toList();
    return ResponseEntity.ok(preferences);
  }

  @GetMapping("/recommendations/{applicationId}")
  public ResponseEntity<AiRecommendation> getRecommendation(@PathVariable String applicationId) {
    AiRecommendation rec = aiRecommendationRepository.findByApplicationId(applicationId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "No AI recommendation found for this application"));
    return ResponseEntity.ok(rec);
  }

  @PostMapping("/recommendations/{applicationId}")
  public ResponseEntity<AiRecommendation> generateRecommendation(@PathVariable String applicationId) {
    // Load student application
    StudentApplication application = studentApplicationRepository.findById(applicationId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

    // Extract resume text
    String resumeText = "";
    if (application.getResumeUrl() != null && !application.getResumeUrl().isBlank()) {
      resumeText = pdfTextExtractor.extractText(application.getResumeUrl());
    }

    // Load interview if exists
    Interview interview = interviewRepository.findByApplicationId(applicationId).orElse(null);

    MatchPreference matchPreference = matchPreferenceRepository.findByApplicationId(applicationId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "No match preference found for this application"));
    List<RoleReference> rankedRoles = matchPreference.getRankedRoles();
    if (rankedRoles == null || rankedRoles.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "No ranked roles found for this application");
    }

    // Load approved startups for this application's cohort
    String term = application.getTerm();
    List<Startup> startups = startupRepository.findByTermAndStatus(term, "approved");
    if (startups.isEmpty()) {
      startups = startupRepository.findByTerm(term);
    }

    // Call OpenAI
    List<AiRecommendation.RoleScore> roleScores = openAiService.generateRecommendations(
        resumeText, application, interview, startups, rankedRoles);

    // Upsert into MongoDB
    AiRecommendation rec = aiRecommendationRepository.findByApplicationId(applicationId)
        .orElseGet(() -> {
          AiRecommendation newRec = new AiRecommendation();
          newRec.setApplicationId(applicationId);
          newRec.setGeneratedAt(Instant.now());
          return newRec;
        });

    rec.setRoleScores(roleScores);
    rec.setUpdatedAt(Instant.now());
    if (rec.getGeneratedAt() == null) {
      rec.setGeneratedAt(Instant.now());
    }

    AiRecommendation saved = aiRecommendationRepository.save(rec);
    return ResponseEntity.ok(saved);
  }

  /**
   * Add or remove a role from a student's matched roles list.
   * Body: { "action": "add"|"remove"|"clear", "role": { startupId, positionIndex, startupName, roleType } }
   * "clear" removes all matched roles. "role" is required for add/remove.
   */
  @PatchMapping("/preferences/{applicationId}/assign")
  public ResponseEntity<MatchPreference> assignRole(
      @PathVariable String applicationId,
      @RequestBody Map<String, Object> body) {

    MatchPreference pref = matchPreferenceRepository.findByApplicationId(applicationId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "No match preference found for this application"));

    String action = (String) body.getOrDefault("action", "add");
    List<MatchPreference.RoleReference> matched = pref.getMatchedRoles();
    if (matched == null) {
      matched = new ArrayList<>();
    }

    if ("clear".equals(action)) {
      matched.clear();
    } else {
      @SuppressWarnings("unchecked")
      Map<String, Object> roleData = (Map<String, Object>) body.get("role");
      if (roleData == null) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "role is required for add/remove");
      }

      String startupId = (String) roleData.get("startupId");
      int positionIndex = ((Number) roleData.get("positionIndex")).intValue();

      if ("remove".equals(action)) {
        matched.removeIf(r -> r.getStartupId().equals(startupId) && r.getPositionIndex() == positionIndex);
      } else {
        // add — prevent duplicates
        boolean alreadyExists = matched.stream().anyMatch(
            r -> r.getStartupId().equals(startupId) && r.getPositionIndex() == positionIndex);
        if (!alreadyExists) {
          MatchPreference.RoleReference role = new MatchPreference.RoleReference();
          role.setStartupId(startupId);
          role.setPositionIndex(positionIndex);
          matched.add(role);
        }
      }
    }

    pref.setMatchedRoles(matched);
    pref.setUpdatedAt(Instant.now());
    MatchPreference saved = matchPreferenceRepository.save(pref);
    return ResponseEntity.ok(saved);
  }
}
