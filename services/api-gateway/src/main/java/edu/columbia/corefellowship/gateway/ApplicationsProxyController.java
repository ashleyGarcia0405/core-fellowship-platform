package edu.columbia.corefellowship.gateway;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/v1")
public class ApplicationsProxyController {

  private final RestClient client;

  public ApplicationsProxyController(@Value("${services.applications.baseUrl}") String baseUrl) {
    this.client = RestClient.builder().baseUrl(baseUrl).build();
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

  // Student Applications Endpoints
  @PostMapping("/students/applications")
  public ResponseEntity<Object> createStudentApplication(
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.post().uri("/v1/students/applications");
    return addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(Object.class);
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
    return addUserHeadersToGet(spec.uri(uri.toString()), request)
        .retrieve()
        .toEntity(Object.class);
  }

  @GetMapping("/students/applications/{id}")
  public ResponseEntity<Object> getStudentApplication(
      @PathVariable String id,
      HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    return addUserHeadersToGet(spec.uri("/v1/students/applications/" + id), request)
        .retrieve()
        .toEntity(Object.class);
  }

  @PatchMapping("/students/applications/{id}")
  public ResponseEntity<Object> updateStudentApplication(
      @PathVariable String id,
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.patch().uri("/v1/students/applications/" + id);
    return addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(Object.class);
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

    return spec
        .body(builder.build())
        .retrieve()
        .toEntity(Object.class);
  }

  @GetMapping("/students/applications/{id}/resume")
  public ResponseEntity<Object> getResumeUrl(
      @PathVariable String id,
      HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    return addUserHeadersToGet(spec.uri("/v1/students/applications/" + id + "/resume"), request)
        .retrieve()
        .toEntity(Object.class);
  }

  // Startup Endpoints
  @PostMapping("/startups/intake")
  public ResponseEntity<Object> createStartup(
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    RestClient.RequestBodySpec spec = client.post().uri("/v1/startups/intake");
    return addUserHeadersToBody(spec, request)
        .body(body)
        .retrieve()
        .toEntity(Object.class);
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
    return addUserHeadersToGet(spec.uri(uri.toString()), request)
        .retrieve()
        .toEntity(Object.class);
  }

  @GetMapping("/startups/{id}")
  public ResponseEntity<Object> getStartup(
      @PathVariable String id,
      HttpServletRequest request) {
    RestClient.RequestHeadersUriSpec<?> spec = client.get();
    return addUserHeadersToGet(spec.uri("/v1/startups/" + id), request)
        .retrieve()
        .toEntity(Object.class);
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
    return addUserHeadersToGet(spec.uri(uri.toString()), request)
        .retrieve()
        .toEntity(Object.class);
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
    return addUserHeadersToGet(spec.uri(uri.toString()), request)
        .retrieve()
        .toEntity(String.class);
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
    return addUserHeadersToGet(spec.uri(uri.toString()), request)
        .retrieve()
        .toEntity(Object.class);
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
    return addUserHeadersToGet(spec.uri(uri.toString()), request)
        .retrieve()
        .toEntity(String.class);
  }
}