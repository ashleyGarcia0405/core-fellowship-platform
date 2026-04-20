package edu.columbia.corefellowship.applications.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Collections;

/**
 * Filter to convert X-User-* headers (set by API gateway) into Spring Security Authentication.
 *
 * The API gateway validates JWTs and forwards user information via headers:
 * - X-User-Id: User's MongoDB ObjectId
 * - X-User-Role: User's role (e.g., "ROLE_USER", "ROLE_ADMIN")
 * - X-User-Email: User's email address
 * - X-Service-Signature: HMAC-SHA256 of "userId:role:email" using the shared inter-service secret
 *
 * The signature is verified before trusting any headers. Requests missing or with an
 * invalid signature are rejected with 401, preventing header-spoofing attacks.
 */
@Component
public class UserHeaderAuthenticationFilter extends OncePerRequestFilter {

  private final String interServiceSecret;

  public UserHeaderAuthenticationFilter(
      @Value("${inter.service.secret}") String interServiceSecret) {
    this.interServiceSecret = interServiceSecret;
  }

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain) throws ServletException, IOException {

    String userId = request.getHeader("X-User-Id");
    String userRole = request.getHeader("X-User-Role");
    String userEmail = request.getHeader("X-User-Email");
    String receivedSignature = request.getHeader("X-Service-Signature");

    // If user headers are present, verify the signature before trusting them
    if (userId != null && userRole != null) {
      if (receivedSignature == null || !verifySignature(userId, userRole, userEmail, receivedSignature)) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"Invalid or missing service signature\"}");
        return;
      }

      SimpleGrantedAuthority authority = new SimpleGrantedAuthority(userRole);
      UsernamePasswordAuthenticationToken authentication =
          new UsernamePasswordAuthenticationToken(
              userEmail != null ? userEmail : userId,
              null,
              Collections.singletonList(authority)
          );

      SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    filterChain.doFilter(request, response);
  }

  private boolean verifySignature(String userId, String role, String email, String received) {
    try {
      String payload = (userId != null ? userId : "") + ":"
          + (role != null ? role : "") + ":"
          + (email != null ? email : "");
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(interServiceSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      String expected = Base64.getEncoder().encodeToString(
          mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
      return MessageDigest.isEqual(
          expected.getBytes(StandardCharsets.UTF_8),
          received.getBytes(StandardCharsets.UTF_8));
    } catch (Exception e) {
      return false;
    }
  }
}