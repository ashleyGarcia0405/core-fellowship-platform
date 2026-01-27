package edu.columbia.corefellowship.identity.util;

import edu.columbia.corefellowship.identity.config.JwtProperties;
import edu.columbia.corefellowship.identity.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

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
   * Generate a JWT token for the given user
   */
  public String generateToken(User user) {
    Instant now = Instant.now();
    Instant expiration = now.plusSeconds(jwtProperties.getExpirationHours() * 3600L);

    return Jwts.builder()
        .subject(user.getId()) // userId as subject
        .claim("email", user.getEmail())
        .claim("userType", user.getUserType().name())
        .claim("role", user.getRole().name())
        .claim("fullName", user.getFullName())
        .claim("companyName", user.getCompanyName())
        .issuer(jwtProperties.getIssuer())
        .audience().add(jwtProperties.getAudience()).and()
        .issuedAt(Date.from(now))
        .expiration(Date.from(expiration))
        .signWith(secretKey)
        .compact();
  }

  /**
   * Validate a JWT token and return its claims
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
   * Extract userId from token subject
   */
  public String extractUserId(String token) {
    Claims claims = validateToken(token);
    return claims.getSubject();
  }

  /**
   * Extract email from token claims
   */
  public String extractEmail(String token) {
    Claims claims = validateToken(token);
    return claims.get("email", String.class);
  }

  /**
   * Extract role from token claims
   */
  public String extractRole(String token) {
    Claims claims = validateToken(token);
    return claims.get("role", String.class);
  }
}
