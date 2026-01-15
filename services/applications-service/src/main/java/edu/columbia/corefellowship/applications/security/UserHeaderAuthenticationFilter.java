package edu.columbia.corefellowship.applications.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Filter to convert X-User-* headers (set by API gateway) into Spring Security Authentication.
 *
 * The API gateway validates JWTs and forwards user information via headers:
 * - X-User-Id: User's MongoDB ObjectId
 * - X-User-Role: User's role (e.g., "ROLE_USER", "ROLE_ADMIN")
 * - X-User-Email: User's email address
 *
 * This filter trusts those headers and creates a Spring Security authentication context.
 */
@Component
public class UserHeaderAuthenticationFilter extends OncePerRequestFilter {

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain) throws ServletException, IOException {

    String userId = request.getHeader("X-User-Id");
    String userRole = request.getHeader("X-User-Role");
    String userEmail = request.getHeader("X-User-Email");

    // If user headers are present, create authentication
    if (userId != null && userRole != null) {
      SimpleGrantedAuthority authority = new SimpleGrantedAuthority(userRole);
      UsernamePasswordAuthenticationToken authentication =
          new UsernamePasswordAuthenticationToken(
              userEmail != null ? userEmail : userId, // principal
              null, // credentials (no password needed)
              Collections.singletonList(authority)
          );

      SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    filterChain.doFilter(request, response);
  }
}