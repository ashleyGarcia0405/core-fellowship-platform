package edu.columbia.corefellowship.gateway;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/v1")
public class ApplicationsProxyController {

  private final RestClient client;
  private final String interServiceSecret;

  public ApplicationsProxyController(
      @Value("${services.applications.baseUrl}") String baseUrl,
      @Value("${inter.service.secret}") String interServiceSecret) {
    this.interServiceSecret = interServiceSecret;
    JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory();

    requestFactory.setReadTimeout(Duration.ofSeconds(60));
    this.client = RestClient.builder()
        .baseUrl(baseUrl)
        .requestFactory(requestFactory)
        .build();
  }

  /**
   * Computes an HMAC-SHA256 signature over userId:role:email using the shared inter-service secret.
   * Added as X-Service-Signature on every forwarded request so the applications service
   * can verify the headers came from the gateway and not a spoofed caller.
   */
  private String computeSignature(String userId, String role, String email) {
    try {
      String payload = (userId != null ? userId : "") + ":"
          + (role != null ? role : "") + ":"
          + (email != null ? email : "");
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(interServiceSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      return Base64.getEncoder().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) {
      throw new RuntimeException("Failed to compute inter-service signature", e);
    }
  }

  /**
   * Helper method to add user context headers from request attributes.
   * Extracts X-User-Id and X-User-Role from the request attributes set by JwtAuthenticationFilter.
   */
  private RestClient.RequestBodySpec addUserHeadersToBody(
      RestClient.RequestBodySpec spec, HttpServletRequest request) {
    String userId = (String) request.getAttribute("X-User-Id");
    String userRole = (String) request.getAttribute("X-User-Role");
    String userEmail = (String) request.getAttribute("X-User-Email");
    String userType = (String) request.getAttribute("X-User-Type");

    if (userId != null) {
      spec = spec.header("X-User-Id", userId);
    }
    if (userRole != null) {
      spec = spec.header("X-User-Role", userRole);
    }
    if (userEmail != null) {
      spec = spec.header("X-User-Email", userEmail);
    }
    if (userType != null) {
      spec = spec.header("X-User-Type", userType);
    }
    spec = spec.header("X-Service-Signature", computeSignature(userId, userRole, userEmail));

    return spec;
  }

  /**
   * Helper method to add user context headers for GET requests.
   */
  private RestClient.RequestHeadersSpec<?> addUserHeadersToGet(
      RestClient.RequestHeadersSpec<?> spec, HttpServletRequest request) {
    String userId = (String) request.getAttribute("X-User-Id");
    String userRole = (String) request.getAttribute("X-User-Role");
    String userEmail = (String) request.getAttribute("X-User-Email");
    String userType = (String) request.getAttribute("X-User-Type");

    if (userId != null) {
      spec = spec.header("X-User-Id", userId);
    }
    if (userRole != null) {
      spec = spec.header("X-User-Role", userRole);
    }
    if (userEmail != null) {
      spec = spec.header("X-User-Email", userEmail);
    }
    if (userType != null) {
      spec = spec.header("X-User-Type", userType);
    }
    spec = spec.header("X-Service-Signature", computeSignature(userId, userRole, userEmail));

    return spec;
  }

  @ExceptionHandler(ResourceAccessException.class)
  public ResponseEntity<Object> handleResourceAccessException(ResourceAccessException ex) {
    System.out.println(">>> ApplicationsProxy connection error: " + ex.getMessage());
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
        .body(Map.of("error", "Applications service is temporarily unavailable. Please try again."));
  }

  // Student Applications Endpoints
  @PostMapping("/students/applications")
  public ResponseEntity<Object> createStudentApplication(
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.post().uri("/v1/students/applications");
    ResponseEntity<String> response = addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @GetMapping("/students/applications")
  public ResponseEntity<Object> getStudentApplications(
      @RequestParam(required = false) String term,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      HttpServletRequest request) {

    String uri = UriComponentsBuilder.fromPath("/v1/students/applications")
        .queryParamIfPresent("term", Optional.ofNullable(term))
        .queryParamIfPresent("status", Optional.ofNullable(status))
        .queryParamIfPresent("page", Optional.ofNullable(page))
        .queryParamIfPresent("size", Optional.ofNullable(size))
        .build()
        .toUriString();

    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri(uri), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @GetMapping("/students/applications/{id}")
  public ResponseEntity<Object> getStudentApplication(
      @PathVariable String id,
      HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri("/v1/students/applications/" + id), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @PatchMapping("/students/applications/{id}")
  public ResponseEntity<Object> updateStudentApplication(
      @PathVariable String id,
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.patch().uri("/v1/students/applications/" + id);
    ResponseEntity<String> response = addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @PatchMapping("/students/applications/{id}/interview-eligible")
  public ResponseEntity<Object> updateInterviewEligibility(
      @PathVariable String id,
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.patch().uri("/v1/students/applications/" + id + "/interview-eligible");
    ResponseEntity<String> response = addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @PostMapping("/students/applications/{id}/resume")
  public ResponseEntity<Object> uploadResume(
      @PathVariable String id,
      @RequestParam("file") MultipartFile file,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = addUserHeadersToBody(
        client.post().uri("/v1/students/applications/" + id + "/resume"),
        request);

    // Forward the file as multipart
    org.springframework.http.client.MultipartBodyBuilder builder =
        new org.springframework.http.client.MultipartBodyBuilder();
    builder.part("file", file.getResource());

    ResponseEntity<String> response = spec
        .body(builder.build())
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @PostMapping("/students/applications/resume")
  public ResponseEntity<Object> uploadResumeBeforeCreate(
      @RequestParam("file") MultipartFile file,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = addUserHeadersToBody(
        client.post().uri("/v1/students/applications/resume"),
        request);

    org.springframework.http.client.MultipartBodyBuilder builder =
        new org.springframework.http.client.MultipartBodyBuilder();
    builder.part("file", file.getResource());

    ResponseEntity<String> response = spec
        .body(builder.build())
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @GetMapping("/students/applications/{id}/resume")
  public ResponseEntity<Object> getResumeUrl(
      @PathVariable String id,
      HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri("/v1/students/applications/" + id + "/resume"), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  // Interview Endpoints
  @PostMapping("/students/applications/{id}/interview")
  public ResponseEntity<Object> createInterview(
      @PathVariable String id,
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.post().uri("/v1/students/applications/" + id + "/interview");
    ResponseEntity<String> response = addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @GetMapping("/students/applications/{id}/interview")
  public ResponseEntity<Object> getInterview(
      @PathVariable String id,
      HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri("/v1/students/applications/" + id + "/interview"), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @PatchMapping("/students/applications/{id}/interview")
  public ResponseEntity<Object> updateInterview(
      @PathVariable String id,
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.patch().uri("/v1/students/applications/" + id + "/interview");
    ResponseEntity<String> response = addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  // Match Preference Endpoints
  @PostMapping("/students/applications/{id}/match-preferences")
  public ResponseEntity<Object> createMatchPreferences(
      @PathVariable String id,
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.post().uri("/v1/students/applications/" + id + "/match-preferences");
    ResponseEntity<String> response = addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @GetMapping("/students/applications/{id}/match-preferences")
  public ResponseEntity<Object> getMatchPreferences(
      @PathVariable String id,
      HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri("/v1/students/applications/" + id + "/match-preferences"), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @PatchMapping("/students/applications/{id}/match-preferences")
  public ResponseEntity<Object> updateMatchPreferences(
      @PathVariable String id,
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.patch().uri("/v1/students/applications/" + id + "/match-preferences");
    ResponseEntity<String> response = addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  // Startup Endpoints
  @GetMapping("/startups/available")
  public ResponseEntity<Object> getAvailableStartups(
      @RequestParam String term,
      HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(
        spec.uri("/v1/startups/available?term=" + term), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @PostMapping("/startups/intake")
  public ResponseEntity<Object> createStartup(
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.post().uri("/v1/startups/intake");
    ResponseEntity<String> response = addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @GetMapping("/startups")
  public ResponseEntity<Object> getStartups(
      @RequestParam(required = false) String term,
      @RequestParam(required = false) String status,
      HttpServletRequest request) {

    StringBuilder uri = new StringBuilder("/v1/startups?");
    if (term != null) {
      uri.append("term=").append(term).append("&");
    }
    if (status != null) {
      uri.append("status=").append(status);
    }

    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri(uri.toString()), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @GetMapping("/startups/{id}")
  public ResponseEntity<Object> getStartup(
      @PathVariable String id,
      HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri("/v1/startups/" + id), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  // Export Endpoints
  @GetMapping("/export/students.json")
  public ResponseEntity<Object> exportStudentsJson(
      @RequestParam(required = false) String term,
      @RequestParam(required = false) String status,
      HttpServletRequest request) {

    StringBuilder uri = new StringBuilder("/v1/export/students.json?");
    if (term != null) {
      uri.append("term=").append(term).append("&");
    }
    if (status != null) {
      uri.append("status=").append(status);
    }

    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri(uri.toString()), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @GetMapping("/export/students.csv")
  public ResponseEntity<String> exportStudentsCsv(
      @RequestParam(required = false) String term,
      @RequestParam(required = false) String status,
      HttpServletRequest request) {

    StringBuilder uri = new StringBuilder("/v1/export/students.csv?");
    if (term != null) {
      uri.append("term=").append(term).append("&");
    }
    if (status != null) {
      uri.append("status=").append(status);
    }

    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri(uri.toString()), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponseString(response);
  }

  @GetMapping("/export/startups.json")
  public ResponseEntity<Object> exportStartupsJson(
      @RequestParam(required = false) String term,
      @RequestParam(required = false) String status,
      HttpServletRequest request) {

    StringBuilder uri = new StringBuilder("/v1/export/startups.json?");
    if (term != null) {
      uri.append("term=").append(term).append("&");
    }
    if (status != null) {
      uri.append("status=").append(status);
    }

    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri(uri.toString()), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @GetMapping("/export/startups.csv")
  public ResponseEntity<String> exportStartupsCsv(
      @RequestParam(required = false) String term,
      @RequestParam(required = false) String status,
      HttpServletRequest request) {

    StringBuilder uri = new StringBuilder("/v1/export/startups.csv?");
    if (term != null) {
      uri.append("term=").append(term).append("&");
    }
    if (status != null) {
      uri.append("status=").append(status);
    }

    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri(uri.toString()), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponseString(response);
  }

  // Interview Booking Endpoints
  @GetMapping("/admin/interviews")
  public ResponseEntity<Object> getInterviewBookings(
      @RequestParam String term,
      HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(
        spec.uri("/v1/admin/interviews?term=" + term), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @GetMapping("/students/interviews")
  public ResponseEntity<Object> getStudentInterviewBookings(HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri("/v1/students/interviews"), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @PatchMapping("/admin/interviews/{id}")
  public ResponseEntity<Object> updateInterviewBooking(
      @PathVariable String id,
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.patch().uri("/v1/admin/interviews/" + id);
    ResponseEntity<String> response = addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  // Admin Matching Endpoints
  @GetMapping("/admin/matching/preferences")
  public ResponseEntity<Object> getMatchingPreferences(
      @RequestParam String term,
      HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(
        spec.uri("/v1/admin/matching/preferences?term=" + term), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @GetMapping("/admin/matching/recommendations/{applicationId}")
  public ResponseEntity<Object> getAiRecommendation(
      @PathVariable String applicationId,
      HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(
        spec.uri("/v1/admin/matching/recommendations/" + applicationId), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @PostMapping("/admin/matching/recommendations/{applicationId}")
  public ResponseEntity<Object> generateAiRecommendation(
      @PathVariable String applicationId,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.post()
        .uri("/v1/admin/matching/recommendations/" + applicationId);
    ResponseEntity<String> response = addUserHeadersToBody(spec, request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @PatchMapping("/admin/matching/preferences/{applicationId}/assign")
  public ResponseEntity<Object> assignMatchRole(
      @PathVariable String applicationId,
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.patch()
        .uri("/v1/admin/matching/preferences/" + applicationId + "/assign");
    ResponseEntity<String> response = addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  // VC Endpoints
  @GetMapping("/vc/favorites")
  public ResponseEntity<Object> getVcFavorites(HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri("/v1/vc/favorites"), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @PostMapping("/vc/favorites")
  public ResponseEntity<Object> saveVcFavorite(
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.post().uri("/v1/vc/favorites");
    ResponseEntity<String> response = addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @DeleteMapping("/vc/favorites/{applicationId}")
  public ResponseEntity<Object> removeVcFavorite(
      @PathVariable String applicationId,
      HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.delete();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri("/v1/vc/favorites/" + applicationId), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @PatchMapping("/vc/favorites/{applicationId}")
  public ResponseEntity<Object> updateVcFavorite(
      @PathVariable String applicationId,
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.patch().uri("/v1/vc/favorites/" + applicationId);
    ResponseEntity<String> response = addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @GetMapping("/vc/favorites/export.csv")
  public ResponseEntity<String> exportVcFavoritesCsv(HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri("/v1/vc/favorites/export.csv"), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponseString(response);
  }

  @GetMapping("/vc/portfolio-invites")
  public ResponseEntity<Object> getVcPortfolioInvites(HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri("/v1/vc/portfolio-invites"), request)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  @PostMapping("/vc/portfolio-invites")
  public ResponseEntity<Object> createVcPortfolioInvite(
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.post().uri("/v1/vc/portfolio-invites");
    ResponseEntity<String> response = addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  // Cal.com Webhook Endpoint
  @PostMapping("/webhooks/cal")
  public ResponseEntity<Object> handleCalWebhook(
      @RequestBody Map<String, Object> body,
      @RequestParam(value = "term", required = false) String term,
      HttpServletRequest request) {
    String uri = term != null && !term.isBlank()
        ? "/v1/webhooks/cal?term=" + java.net.URLEncoder.encode(term, java.nio.charset.StandardCharsets.UTF_8)
        : "/v1/webhooks/cal";
    RestClient.RequestBodySpec spec = client.post().uri(uri);
    ResponseEntity<String> response = spec
        .headers(headers -> copyWebhookHeaders(headers, request))
        .body(body)
        .retrieve()
        .toEntity(String.class);
    return forwardResponse(response);
  }

  private void copyWebhookHeaders(HttpHeaders headers, HttpServletRequest request) {
    String secret = request.getHeader("X-Cal-Webhook-Secret");
    if (secret != null) {
      headers.set("X-Cal-Webhook-Secret", secret);
    }
  }

  private ResponseEntity<Object> forwardResponse(ResponseEntity<String> response) {
    HttpHeaders headers = new HttpHeaders();
    if (response.getHeaders().getContentType() != null) {
      headers.setContentType(response.getHeaders().getContentType());
    }
    return ResponseEntity
        .status(response.getStatusCode())
        .headers(headers)
        .body(response.getBody());
  }

  private ResponseEntity<String> forwardResponseString(ResponseEntity<String> response) {
    HttpHeaders headers = new HttpHeaders();
    if (response.getHeaders().getContentType() != null) {
      headers.setContentType(response.getHeaders().getContentType());
    }
    return ResponseEntity
        .status(response.getStatusCode())
        .headers(headers)
        .body(response.getBody());
  }
}
