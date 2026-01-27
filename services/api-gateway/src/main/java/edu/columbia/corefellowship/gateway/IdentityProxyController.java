package edu.columbia.corefellowship.gateway;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

@RestController
public class IdentityProxyController {

  private final RestClient client;

  public IdentityProxyController(@Value("${services.identity.baseUrl}") String baseUrl) {
    this.client = RestClient.builder().baseUrl(baseUrl).build();
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
