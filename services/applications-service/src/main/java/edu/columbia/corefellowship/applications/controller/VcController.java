package edu.columbia.corefellowship.applications.controller;

import edu.columbia.corefellowship.applications.model.StudentApplication;
import edu.columbia.corefellowship.applications.model.VcFavorite;
import edu.columbia.corefellowship.applications.model.VcPortfolioInvite;
import edu.columbia.corefellowship.applications.repository.StudentApplicationRepository;
import edu.columbia.corefellowship.applications.repository.VcFavoriteRepository;
import edu.columbia.corefellowship.applications.repository.VcPortfolioInviteRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/vc")
public class VcController {

  private final VcFavoriteRepository vcFavoriteRepository;
  private final VcPortfolioInviteRepository vcPortfolioInviteRepository;
  private final StudentApplicationRepository studentApplicationRepository;

  public VcController(
      VcFavoriteRepository vcFavoriteRepository,
      VcPortfolioInviteRepository vcPortfolioInviteRepository,
      StudentApplicationRepository studentApplicationRepository) {
    this.vcFavoriteRepository = vcFavoriteRepository;
    this.vcPortfolioInviteRepository = vcPortfolioInviteRepository;
    this.studentApplicationRepository = studentApplicationRepository;
  }

  private void requireVc(String userType, String userId) {
    if (!"VC".equals(userType)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "VC access required");
    }
    if (userId == null || userId.isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User ID is required");
    }
  }

  // --- Favorites ---

  @GetMapping("/favorites")
  public ResponseEntity<List<VcFavorite>> getFavorites(
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-User-Type", required = false) String userType) {

    requireVc(userType, userId);
    List<VcFavorite> favorites = vcFavoriteRepository.findByVcUserId(userId);
    return ResponseEntity.ok(favorites);
  }

  @PostMapping("/favorites")
  public ResponseEntity<VcFavorite> saveFavorite(
      @RequestBody Map<String, Object> body,
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-User-Type", required = false) String userType) {

    requireVc(userType, userId);

    String applicationId = (String) body.get("applicationId");
    if (applicationId == null || applicationId.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "applicationId is required");
    }

    if (!studentApplicationRepository.existsById(applicationId)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found");
    }

    // Upsert: if already favorited, return existing
    VcFavorite favorite = vcFavoriteRepository
        .findByVcUserIdAndApplicationId(userId, applicationId)
        .orElseGet(() -> {
          VcFavorite f = new VcFavorite();
          f.setVcUserId(userId);
          f.setApplicationId(applicationId);
          f.setCreatedAt(Instant.now());
          return f;
        });

    if (body.get("notes") != null) {
      favorite.setNotes((String) body.get("notes"));
    }
    if (body.get("portfolioCompany") != null) {
      favorite.setPortfolioCompany((String) body.get("portfolioCompany"));
    }
    favorite.setUpdatedAt(Instant.now());

    VcFavorite saved = vcFavoriteRepository.save(favorite);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }

  @DeleteMapping("/favorites/{applicationId}")
  public ResponseEntity<Map<String, String>> removeFavorite(
      @PathVariable String applicationId,
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-User-Type", required = false) String userType) {

    requireVc(userType, userId);

    if (!vcFavoriteRepository.existsByVcUserIdAndApplicationId(userId, applicationId)) {
      return ResponseEntity.notFound().build();
    }

    vcFavoriteRepository.deleteByVcUserIdAndApplicationId(userId, applicationId);
    return ResponseEntity.ok(Map.of("message", "Favorite removed"));
  }

  @PatchMapping("/favorites/{applicationId}")
  public ResponseEntity<VcFavorite> updateFavorite(
      @PathVariable String applicationId,
      @RequestBody Map<String, Object> body,
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-User-Type", required = false) String userType) {

    requireVc(userType, userId);

    VcFavorite favorite = vcFavoriteRepository
        .findByVcUserIdAndApplicationId(userId, applicationId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Favorite not found"));

    if (body.containsKey("notes")) {
      favorite.setNotes((String) body.get("notes"));
    }
    if (body.containsKey("portfolioCompany")) {
      favorite.setPortfolioCompany((String) body.get("portfolioCompany"));
    }
    favorite.setUpdatedAt(Instant.now());

    VcFavorite updated = vcFavoriteRepository.save(favorite);
    return ResponseEntity.ok(updated);
  }

  @GetMapping("/favorites/export.csv")
  public ResponseEntity<String> exportFavoritesCsv(
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-User-Type", required = false) String userType) {

    requireVc(userType, userId);

    List<VcFavorite> favorites = vcFavoriteRepository.findByVcUserId(userId);
    List<String> applicationIds = favorites.stream()
        .map(VcFavorite::getApplicationId)
        .collect(Collectors.toList());

    List<StudentApplication> applications = studentApplicationRepository.findAllById(applicationIds);

    Map<String, VcFavorite> favoriteByAppId = favorites.stream()
        .collect(Collectors.toMap(VcFavorite::getApplicationId, f -> f));

    StringBuilder csv = new StringBuilder();
    csv.append("Name,Email,School,Major,Grad Year,Role Preferences,Work Mode,LinkedIn,Notes,Portfolio Company\n");

    for (StudentApplication app : applications) {
      VcFavorite fav = favoriteByAppId.get(app.getId());
      csv.append(escapeCsv(app.getFullName())).append(",");
      csv.append(escapeCsv(app.getEmail())).append(",");
      csv.append(escapeCsv(app.getSchool())).append(",");
      csv.append(escapeCsv(app.getMajor())).append(",");
      csv.append(escapeCsv(app.getGradYear())).append(",");
      csv.append(escapeCsv(app.getRolePreferences() != null ? String.join(";", app.getRolePreferences()) : "")).append(",");
      csv.append(escapeCsv(app.getWorkMode())).append(",");
      csv.append(escapeCsv(app.getLinkedinProfile())).append(",");
      csv.append(escapeCsv(fav != null ? fav.getNotes() : "")).append(",");
      csv.append(escapeCsv(fav != null ? fav.getPortfolioCompany() : "")).append("\n");
    }

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=vc-shortlist.csv")
        .contentType(MediaType.parseMediaType("text/csv"))
        .body(csv.toString());
  }

  // --- Portfolio Invites ---

  @GetMapping("/portfolio-invites")
  public ResponseEntity<List<VcPortfolioInvite>> getPortfolioInvites(
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-User-Type", required = false) String userType) {

    requireVc(userType, userId);
    List<VcPortfolioInvite> invites = vcPortfolioInviteRepository.findByVcUserId(userId);
    return ResponseEntity.ok(invites);
  }

  @PostMapping("/portfolio-invites")
  public ResponseEntity<VcPortfolioInvite> createPortfolioInvite(
      @RequestBody Map<String, Object> body,
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-User-Type", required = false) String userType,
      @RequestHeader(value = "X-User-Email", required = false) String userEmail) {

    requireVc(userType, userId);

    String companyEmail = (String) body.get("companyEmail");
    String companyName = (String) body.get("companyName");

    if (companyEmail == null || companyEmail.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "companyEmail is required");
    }
    if (companyName == null || companyName.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "companyName is required");
    }

    VcPortfolioInvite invite = new VcPortfolioInvite();
    invite.setVcUserId(userId);
    invite.setVcName(userEmail != null ? userEmail : userId);
    invite.setCompanyEmail(companyEmail.trim().toLowerCase());
    invite.setCompanyName(companyName.trim());
    invite.setToken(UUID.randomUUID().toString());
    invite.setStatus("pending");
    invite.setInvitedAt(Instant.now());
    invite.setExpiresAt(Instant.now().plusSeconds(30L * 24 * 3600)); // 30 days

    VcPortfolioInvite saved = vcPortfolioInviteRepository.save(invite);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }

  private String escapeCsv(String value) {
    if (value == null) return "";
    if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
      return "\"" + value.replace("\"", "\"\"") + "\"";
    }
    return value;
  }
}
