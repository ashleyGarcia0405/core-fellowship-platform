package edu.columbia.corefellowship.applications.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException ex) {
    return ResponseEntity
        .status(ex.getStatusCode())
        .body(Map.of(
            "error", ex.getStatusCode().toString(),
            "message", ex.getReason() != null ? ex.getReason() : "An error occurred"
        ));
  }
}