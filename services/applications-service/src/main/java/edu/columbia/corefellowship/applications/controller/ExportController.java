package edu.columbia.corefellowship.applications.controller;

import edu.columbia.corefellowship.applications.model.StudentApplication;
import edu.columbia.corefellowship.applications.model.Startup;
import edu.columbia.corefellowship.applications.repository.StudentApplicationRepository;
import edu.columbia.corefellowship.applications.repository.StartupRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/export")
@PreAuthorize("hasRole('ADMIN')")
public class ExportController {

  private final StudentApplicationRepository studentRepository;
  private final StartupRepository startupRepository;

  public ExportController(
      StudentApplicationRepository studentRepository,
      StartupRepository startupRepository) {
    this.studentRepository = studentRepository;
    this.startupRepository = startupRepository;
  }

  @GetMapping("/students.json")
  public ResponseEntity<List<StudentApplication>> exportStudentsJson(
      @RequestParam(required = false) String term,
      @RequestParam(required = false) String status) {

    List<StudentApplication> applications;

    if (term != null && status != null) {
      applications = studentRepository.findByTermAndStatus(term, status);
    } else if (term != null) {
      applications = studentRepository.findByTerm(term);
    } else if (status != null) {
      applications = studentRepository.findByStatus(status);
    } else {
      applications = studentRepository.findAll();
    }

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=students.json")
        .contentType(MediaType.APPLICATION_JSON)
        .body(applications);
  }

  @GetMapping("/students.csv")
  public ResponseEntity<String> exportStudentsCsv(
      @RequestParam(required = false) String term,
      @RequestParam(required = false) String status) {

    List<StudentApplication> applications;

    if (term != null && status != null) {
      applications = studentRepository.findByTermAndStatus(term, status);
    } else if (term != null) {
      applications = studentRepository.findByTerm(term);
    } else if (status != null) {
      applications = studentRepository.findByStatus(status);
    } else {
      applications = studentRepository.findAll();
    }

    StringBuilder csv = new StringBuilder();

    // Header
    csv.append("ID,Full Name,Pronouns,Email,Grad Year,School,Major,LinkedIn,Portfolio,Role Preferences,Video URL,How Did You Hear,Referral Source,Previously Applied,Previously Participated,Has Internship Offers,Term,Status,Submitted At\n");

    // Data rows
    for (StudentApplication app : applications) {
      csv.append(escapeCsv(app.getId())).append(",");
      csv.append(escapeCsv(app.getFullName())).append(",");
      csv.append(escapeCsv(app.getPronouns())).append(",");
      csv.append(escapeCsv(app.getEmail())).append(",");
      csv.append(escapeCsv(app.getGradYear())).append(",");
      csv.append(escapeCsv(app.getSchool())).append(",");
      csv.append(escapeCsv(app.getMajor())).append(",");
      csv.append(escapeCsv(app.getLinkedinProfile())).append(",");
      csv.append(escapeCsv(app.getPortfolioWebsite())).append(",");
      csv.append(escapeCsv(app.getRolePreferences() != null ? String.join(";", app.getRolePreferences()) : "")).append(",");
      csv.append(escapeCsv(app.getVideoSubmissionUrl())).append(",");
      csv.append(escapeCsv(app.getHowDidYouHear())).append(",");
      csv.append(escapeCsv(app.getReferralSource())).append(",");
      csv.append(app.getPreviouslyApplied() != null ? app.getPreviouslyApplied().toString() : "").append(",");
      csv.append(app.getPreviouslyParticipated() != null ? app.getPreviouslyParticipated().toString() : "").append(",");
      csv.append(app.getHasUpcomingInternshipOffers() != null ? app.getHasUpcomingInternshipOffers().toString() : "").append(",");
      csv.append(escapeCsv(app.getTerm())).append(",");
      csv.append(escapeCsv(app.getStatus())).append(",");
      csv.append(app.getSubmittedAt() != null ? app.getSubmittedAt().toString() : "");
      csv.append("\n");
    }

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=students.csv")
        .contentType(MediaType.parseMediaType("text/csv"))
        .body(csv.toString());
  }

  @GetMapping("/startups.json")
  public ResponseEntity<List<Startup>> exportStartupsJson(
      @RequestParam(required = false) String term,
      @RequestParam(required = false) String status) {

    List<Startup> startups;

    if (term != null && status != null) {
      startups = startupRepository.findByTermAndStatus(term, status);
    } else if (term != null) {
      startups = startupRepository.findByTerm(term);
    } else if (status != null) {
      startups = startupRepository.findByStatus(status);
    } else {
      startups = startupRepository.findAll();
    }

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=startups.json")
        .contentType(MediaType.APPLICATION_JSON)
        .body(startups);
  }

  @GetMapping("/startups.csv")
  public ResponseEntity<String> exportStartupsCsv(
      @RequestParam(required = false) String term,
      @RequestParam(required = false) String status) {

    List<Startup> startups;

    if (term != null && status != null) {
      startups = startupRepository.findByTermAndStatus(term, status);
    } else if (term != null) {
      startups = startupRepository.findByTerm(term);
    } else if (status != null) {
      startups = startupRepository.findByStatus(status);
    } else {
      startups = startupRepository.findAll();
    }

    StringBuilder csv = new StringBuilder();

    // Header
    csv.append("ID,Company Name,Website,Industry,Description,Stage,Team Size,Founded Year,Contact Name,Contact Title,Contact Email,Contact Phone,Operating Mode,Time Zone,Interns Supervisor,Has Hired Interns Previously,Number Of Interns Needed,Will Pay Interns,Pay Amount,Looking For Permanent Intern,Project Description URL,Referral Source,Commitment Acknowledged,Term,Status,Submitted At\n");

    // Data rows
    for (Startup startup : startups) {
      csv.append(escapeCsv(startup.getId())).append(",");
      csv.append(escapeCsv(startup.getCompanyName())).append(",");
      csv.append(escapeCsv(startup.getWebsite())).append(",");
      csv.append(escapeCsv(startup.getIndustry())).append(",");
      csv.append(escapeCsv(startup.getDescription())).append(",");
      csv.append(escapeCsv(startup.getStage())).append(",");
      csv.append(escapeCsv(startup.getTeamSize())).append(",");
      csv.append(escapeCsv(startup.getFoundedYear())).append(",");
      csv.append(escapeCsv(startup.getContactName())).append(",");
      csv.append(escapeCsv(startup.getContactTitle())).append(",");
      csv.append(escapeCsv(startup.getContactEmail())).append(",");
      csv.append(escapeCsv(startup.getContactPhone())).append(",");
      csv.append(escapeCsv(startup.getOperatingMode())).append(",");
      csv.append(escapeCsv(startup.getTimeZone())).append(",");
      csv.append(escapeCsv(startup.getInternsSupervisor())).append(",");
      csv.append(startup.getHasHiredInternsPreviously() != null ? startup.getHasHiredInternsPreviously().toString() : "").append(",");
      csv.append(startup.getNumberOfInternsNeeded() != null ? startup.getNumberOfInternsNeeded().toString() : "").append(",");
      csv.append(escapeCsv(startup.getWillPayInterns())).append(",");
      csv.append(escapeCsv(startup.getPayAmount())).append(",");
      csv.append(escapeCsv(startup.getLookingForPermanentIntern())).append(",");
      csv.append(escapeCsv(startup.getProjectDescriptionUrl())).append(",");
      csv.append(escapeCsv(startup.getReferralSource())).append(",");
      csv.append(startup.getCommitmentAcknowledged() != null ? startup.getCommitmentAcknowledged().toString() : "").append(",");
      csv.append(escapeCsv(startup.getTerm())).append(",");
      csv.append(escapeCsv(startup.getStatus())).append(",");
      csv.append(startup.getSubmittedAt() != null ? startup.getSubmittedAt().toString() : "");
      csv.append("\n");
    }

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=startups.csv")
        .contentType(MediaType.parseMediaType("text/csv"))
        .body(csv.toString());
  }

  private String escapeCsv(String value) {
    if (value == null) {
      return "";
    }
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
      return "\"" + value.replace("\"", "\"\"") + "\"";
    }
    return value;
  }
}