package edu.columbia.corefellowship.gateway;

import java.time.Duration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

@RestController
public class IdentityProxyController {

  private final RestClient client;

  public IdentityProxyController(@Value("${services.identity.baseUrl}") String baseUrl) {
    JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory();
    requestFactory.setReadTimeout(Duration.ofSeconds(60));
    this.client = RestClient.builder()
        .baseUrl(baseUrl)
        .requestFactory(requestFactory)
        .build();
  }

  @GetMapping("/v1/identity/health")
  public Map<?, ?> identityHealth() {
    return client.get().uri("/health").retrieve().body(Map.class);
  }

  /**
   * Proxy endpoint for user registration.
   * Forwards to identity-service POST /api/auth/register
   */
  @PostMapping("/v1/auth/register")
  public ResponseEntity<Object> register(@RequestBody Map<String, Object> request) {
    System.out.println(">>> IdentityProxyController.register called");
    try {
      ResponseEntity<String> response = client.post()
          .uri("/api/auth/register")
          .body(request)
          .retrieve()
          .toEntity(String.class);
      return forwardResponse(response);
    } catch (HttpClientErrorException | HttpServerErrorException ex) {
      System.out.println(">>> IdentityProxyController.register downstream status "
          + ex.getStatusCode() + " body=" + ex.getResponseBodyAsString());
      throw ex;
    } catch (ResourceAccessException ex) {
      System.out.println(">>> IdentityProxyController.register connection error: " + ex.getMessage());
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
          .body(Map.of("error", "Identity service is temporarily unavailable. Please try again."));
    }
  }

  /**
   * Proxy endpoint for user login.
   * Forwards to identity-service POST /api/auth/login
   */
  @PostMapping("/v1/auth/login")
  public ResponseEntity<Object> login(@RequestBody Map<String, Object> request) {
    System.out.println(">>> IdentityProxyController.login called");
    try {
      ResponseEntity<String> response = client.post()
          .uri("/api/auth/login")
          .body(request)
          .retrieve()
          .toEntity(String.class);
      return forwardResponse(response);
    } catch (HttpClientErrorException | HttpServerErrorException ex) {
      System.out.println(">>> IdentityProxyController.login downstream status "
          + ex.getStatusCode() + " body=" + ex.getResponseBodyAsString());
      throw ex;
    } catch (ResourceAccessException ex) {
      System.out.println(">>> IdentityProxyController.login connection error: " + ex.getMessage());
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
          .body(Map.of("error", "Authentication service is starting up. Please try again in a few seconds."));
    }
  }

  /**
   * Proxy endpoint for password reset.
   * Forwards to identity-service POST /api/auth/reset-password
   */
  @PostMapping("/v1/auth/reset-password")
  public ResponseEntity<Object> resetPassword(@RequestBody Map<String, Object> request) {
    System.out.println(">>> IdentityProxyController.resetPassword called");
    try {
      ResponseEntity<String> response = client.post()
          .uri("/api/auth/reset-password")
          .body(request)
          .retrieve()
          .toEntity(String.class);
      return forwardResponse(response);
    } catch (HttpClientErrorException | HttpServerErrorException ex) {
      System.out.println(">>> IdentityProxyController.resetPassword downstream status "
          + ex.getStatusCode() + " body=" + ex.getResponseBodyAsString());
      throw ex;
    } catch (ResourceAccessException ex) {
      System.out.println(">>> IdentityProxyController.resetPassword connection error: " + ex.getMessage());
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
          .body(Map.of("error", "Identity service is temporarily unavailable. Please try again."));
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
}
