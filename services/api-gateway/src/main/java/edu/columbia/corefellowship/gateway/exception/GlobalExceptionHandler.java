package edu.columbia.corefellowship.gateway.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

@ControllerAdvice
public class GlobalExceptionHandler {

  /**
   * Handle HTTP client errors (4xx) from downstream services.
   * Forward the status code and response body from the downstream service.
   */
  @ExceptionHandler(HttpClientErrorException.class)
  public ResponseEntity<String> handleHttpClientError(HttpClientErrorException ex) {
    return ResponseEntity
        .status(ex.getStatusCode())
        .body(ex.getResponseBodyAsString());
  }

  /**
   * Handle HTTP server errors (5xx) from downstream services.
   * Forward the status code and response body from the downstream service.
   */
  @ExceptionHandler(HttpServerErrorException.class)
  public ResponseEntity<String> handleHttpServerError(HttpServerErrorException ex) {
    return ResponseEntity
        .status(ex.getStatusCode())
        .body(ex.getResponseBodyAsString());
  }
}