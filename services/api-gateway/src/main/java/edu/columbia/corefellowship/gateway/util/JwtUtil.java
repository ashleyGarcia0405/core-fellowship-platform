package edu.columbia.corefellowship.gateway.util;

import edu.columbia.corefellowship.gateway.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {

  private final JwtProperties jwtProperties;
  private final SecretKey secretKey;

  public JwtUtil(JwtProperties jwtProperties) {
    this.jwtProperties = jwtProperties;
    this.secretKey = Keys.hmacShaKeyFor(
        jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8)
    );
  }

  /**
   * Validates the JWT token and returns the claims.
   *
   * @param token JWT token string
   * @return Claims object containing token data
   * @throws io.jsonwebtoken.JwtException if validation fails
   */
  public Claims validateToken(String token) {
    return Jwts.parser()
        .verifyWith(secretKey)
        .requireIssuer(jwtProperties.getIssuer())
        .requireAudience(jwtProperties.getAudience())
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  /**
   * Extracts the userId from the JWT subject claim.
   *
   * @param token JWT token string
   * @return userId (MongoDB ObjectId as string)
   */
  public String extractUserId(String token) {
    Claims claims = validateToken(token);
    return claims.getSubject();
  }

  /**
   * Extracts the user's role from the JWT claims.
   *
   * @param token JWT token string
   * @return role string (e.g., "ROLE_USER", "ROLE_ADMIN")
   */
  public String extractRole(String token) {
    Claims claims = validateToken(token);
    return claims.get("role", String.class);
  }

  /**
   * Extracts the user's email from the JWT claims.
   *
   * @param token JWT token string
   * @return email string
   */
  public String extractEmail(String token) {
    Claims claims = validateToken(token);
    return claims.get("email", String.class);
  }

  /**
   * Extracts the user's type from the JWT claims.
   *
   * @param token JWT token string
   * @return userType string (e.g., "STUDENT", "STARTUP", "ADMIN")
   */
  public String extractUserType(String token) {
    Claims claims = validateToken(token);
    return claims.get("userType", String.class);
  }
}
