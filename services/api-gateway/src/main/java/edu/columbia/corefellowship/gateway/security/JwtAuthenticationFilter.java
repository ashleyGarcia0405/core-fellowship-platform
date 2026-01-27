package edu.columbia.corefellowship.gateway.security;

import edu.columbia.corefellowship.gateway.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * JWT Authentication Filter for API Gateway.
 *
 * This filter:
 * 1. Extracts Bearer token from Authorization header
 * 2. Validates JWT using JwtUtil
 * 3. Creates Spring Security Authentication
 * 4. Adds X-User-Id and X-User-Role headers for downstream services
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtUtil jwtUtil;

  public JwtAuthenticationFilter(JwtUtil jwtUtil) {
    this.jwtUtil = jwtUtil;
  }

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain) throws ServletException, IOException {

    // Skip filter for OPTIONS requests (CORS preflight)
    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
      filterChain.doFilter(request, response);
      return;
    }

    // Extract Authorization header
    String authHeader = request.getHeader("Authorization");

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    try {
      // Extract token (remove "Bearer " prefix)
      String token = authHeader.substring(7);

      // Validate token and extract claims
      String userId = jwtUtil.extractUserId(token);
      String role = jwtUtil.extractRole(token);
      String email = jwtUtil.extractEmail(token);

      // Create Spring Security Authentication
      SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);
      UsernamePasswordAuthenticationToken authentication =
          new UsernamePasswordAuthenticationToken(
              email, // principal (use email as identifier)
              null,  // credentials (no password needed)
              Collections.singletonList(authority)
          );

      authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(authentication);

      // Add headers for downstream services
      request.setAttribute("X-User-Id", userId);
      request.setAttribute("X-User-Role", role);
      request.setAttribute("X-User-Email", email);

    } catch (JwtException e) {
      // Invalid token - clear security context and let Spring Security handle it
      SecurityContextHolder.clearContext();
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.setContentType("application/json");
      response.getWriter().write(
          "{\"error\": \"Invalid or expired token\", \"message\": \"" + e.getMessage() + "\"}"
      );
      return;
    }

    filterChain.doFilter(request, response);
  }
}
