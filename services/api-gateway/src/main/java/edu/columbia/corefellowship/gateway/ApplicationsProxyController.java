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

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/v1")
public class ApplicationsProxyController {

  private final RestClient client;

  public ApplicationsProxyController(@Value("${services.applications.baseUrl}") String baseUrl) {
    JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory();
    requestFactory.setReadTimeout(Duration.ofSeconds(60));
    this.client = RestClient.builder()
        .baseUrl(baseUrl)
        .requestFactory(requestFactory)
        .build();
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

    if (userId != null) {
      spec = spec.header("X-User-Id", userId);
    }
    if (userRole != null) {
      spec = spec.header("X-User-Role", userRole);
    }
    if (userEmail != null) {
      spec = spec.header("X-User-Email", userEmail);
    }

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

    if (userId != null) {
      spec = spec.header("X-User-Id", userId);
    }
    if (userRole != null) {
      spec = spec.header("X-User-Role", userRole);
    }
    if (userEmail != null) {
      spec = spec.header("X-User-Email", userEmail);
    }

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
      HttpServletRequest request) {

    StringBuilder uri = new StringBuilder("/v1/students/applications?");
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

    // Forward multipart file upload to applications-service
    // Note: RestClient doesn't support multipart easily, so we use a workaround
    // by forwarding the request headers and using Spring's built-in multipart handling

    String userId = (String) request.getAttribute("X-User-Id");
    String userRole = (String) request.getAttribute("X-User-Role");
    String userEmail = (String) request.getAttribute("X-User-Email");

    RestClient.RequestBodySpec spec = client.post()
        .uri("/v1/students/applications/" + id + "/resume");

    if (userId != null) {
      spec = spec.header("X-User-Id", userId);
    }
    if (userRole != null) {
      spec = spec.header("X-User-Role", userRole);
    }
    if (userEmail != null) {
      spec = spec.header("X-User-Email", userEmail);
    }

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

    String userId = (String) request.getAttribute("X-User-Id");
    String userRole = (String) request.getAttribute("X-User-Role");
    String userEmail = (String) request.getAttribute("X-User-Email");

    RestClient.RequestBodySpec spec = client.post()
        .uri("/v1/students/applications/resume");

    if (userId != null) {
      spec = spec.header("X-User-Id", userId);
    }
    if (userRole != null) {
      spec = spec.header("X-User-Role", userRole);
    }
    if (userEmail != null) {
      spec = spec.header("X-User-Email", userEmail);
    }

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
  public ResponseEntity<Object> getAvailableStartups(HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri("/v1/startups/available"), request)
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
  public ResponseEntity<Object> getInterviewBookings(HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    ResponseEntity<String> response = addUserHeadersToGet(spec.uri("/v1/admin/interviews"), request)
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

  // Cal.com Webhook Endpoint
  @PostMapping("/webhooks/cal")
  public ResponseEntity<Object> handleCalWebhook(
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.post().uri("/v1/webhooks/cal");
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
