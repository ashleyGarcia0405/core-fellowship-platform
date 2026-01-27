package edu.columbia.corefellowship.identity.service;

import edu.columbia.corefellowship.identity.config.JwtProperties;
import edu.columbia.corefellowship.identity.dto.LoginRequest;
import edu.columbia.corefellowship.identity.dto.LoginResponse;
import edu.columbia.corefellowship.identity.dto.RegisterRequest;
import edu.columbia.corefellowship.identity.dto.RegisterResponse;
import edu.columbia.corefellowship.identity.model.User;
import edu.columbia.corefellowship.identity.model.UserRole;
import edu.columbia.corefellowship.identity.repository.UserRepository;
import edu.columbia.corefellowship.identity.util.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;
  private final JwtProperties jwtProperties;

  @Value("${admin.registration-token}")
  private String adminRegistrationToken;

  public AuthService(UserRepository userRepository,
                    PasswordEncoder passwordEncoder,
                    JwtUtil jwtUtil,
                    JwtProperties jwtProperties) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtUtil = jwtUtil;
    this.jwtProperties = jwtProperties;
  }

  /**
   * Register a new user
   */
  public RegisterResponse register(RegisterRequest request) {
    // Check if email already exists
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "Email already registered");
    }

    // Check if attempting admin registration
    boolean isAdminRegistration = request.getAdminToken() != null && !request.getAdminToken().isBlank();

    if (isAdminRegistration) {
      // Validate admin token
      if (!adminRegistrationToken.equals(request.getAdminToken())) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
            "Invalid admin registration token");
      }
    }

    // Create new user
    User user = new User();
    user.setEmail(request.getEmail());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setUserType(request.getUserType());

    // Set role based on admin token validation
    if (isAdminRegistration) {
      user.setRole(UserRole.ROLE_ADMIN);
    } else {
      user.setRole(UserRole.ROLE_USER);
    }

    user.setFullName(request.getFullName());
    user.setCompanyName(request.getCompanyName());
    user.setEmailVerified(false);
    user.setAccountEnabled(true);
    user.setAccountLocked(false);
    user.setCreatedAt(Instant.now());
    user.setUpdatedAt(Instant.now());

    User saved = userRepository.save(user);

    return new RegisterResponse(
        saved.getId(),
        saved.getEmail(),
        saved.getUserType(),
        "Registration successful. Please log in."
    );
  }

  /**
   * Authenticate user and return JWT token
   */
  public LoginResponse login(LoginRequest request) {
    // Find user by email
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
            "Invalid email or password"));

    // Verify password
    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
          "Invalid email or password");
    }

    // Check account status
    if (!user.getAccountEnabled()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "Account is disabled");
    }

    if (user.getAccountLocked()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "Account is locked");
    }

    // Update last login
    user.setLastLoginAt(Instant.now());
    userRepository.save(user);

    // Generate JWT
    String token = jwtUtil.generateToken(user);

    // Calculate expiration in seconds
    Integer expiresIn = jwtProperties.getExpirationHours() * 3600;

    return new LoginResponse(
        token,
        "Bearer",
        expiresIn,
        user.getId(),
        user.getEmail(),
        user.getUserType(),
        user.getRole()
    );
  }
}