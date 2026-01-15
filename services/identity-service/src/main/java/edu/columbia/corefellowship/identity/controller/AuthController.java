package edu.columbia.corefellowship.identity.controller;

import edu.columbia.corefellowship.identity.dto.LoginRequest;
import edu.columbia.corefellowship.identity.dto.LoginResponse;
import edu.columbia.corefellowship.identity.dto.RegisterRequest;
import edu.columbia.corefellowship.identity.dto.RegisterResponse;
import edu.columbia.corefellowship.identity.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public ResponseEntity<RegisterResponse> register(
      @Valid @RequestBody RegisterRequest request) {
    RegisterResponse response = authService.register(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(
      @Valid @RequestBody LoginRequest request) {
    LoginResponse response = authService.login(request);
    return ResponseEntity.ok(response);
  }
}