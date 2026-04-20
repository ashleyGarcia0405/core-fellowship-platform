package edu.columbia.corefellowship.identity.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting filter for authentication endpoints.
 *
 * Limits:
 *  - POST /api/auth/login    — 10 requests per minute per IP
 *  - POST /api/auth/register — 3 requests per 10 minutes per IP
 *
 * Each IP gets its own bucket per endpoint. Buckets are created lazily on first request.
 * Returns 429 Too Many Requests with a Retry-After header when the limit is exceeded.
 */
public class RateLimitFilter extends OncePerRequestFilter {

  private static final String LOGIN_PATH    = "/api/auth/login";
  private static final String REGISTER_PATH = "/api/auth/register";

  // Separate maps so login and register limits are tracked independently per IP
  private final ConcurrentHashMap<String, Bucket> loginBuckets    = new ConcurrentHashMap<>();
  private final ConcurrentHashMap<String, Bucket> registerBuckets = new ConcurrentHashMap<>();

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain) throws ServletException, IOException {

    String path   = request.getRequestURI();
    String method = request.getMethod();

    if (!"POST".equalsIgnoreCase(method)) {
      filterChain.doFilter(request, response);
      return;
    }

    Bucket bucket = null;

    if (LOGIN_PATH.equals(path)) {
      bucket = loginBuckets.computeIfAbsent(getClientIp(request), ip -> buildLoginBucket());
    } else if (REGISTER_PATH.equals(path)) {
      bucket = registerBuckets.computeIfAbsent(getClientIp(request), ip -> buildRegisterBucket());
    }

    if (bucket == null) {
      filterChain.doFilter(request, response);
      return;
    }

    if (bucket.tryConsume(1)) {
      filterChain.doFilter(request, response);
    } else {
      response.setStatus(429);
      response.setContentType("application/json");
      response.setHeader("Retry-After", "60");
      response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\"}");
    }
  }

  /** 10 requests per minute */
  private Bucket buildLoginBucket() {
    return Bucket.builder()
        .addLimit(Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1))))
        .build();
  }

  /** 3 requests per 10 minutes */
  private Bucket buildRegisterBucket() {
    return Bucket.builder()
        .addLimit(Bandwidth.classic(3, Refill.intervally(3, Duration.ofMinutes(10))))
        .build();
  }

  private String getClientIp(HttpServletRequest request) {
    // Respect X-Forwarded-For if present (set by load balancer / Cloud Run)
    String forwarded = request.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      return forwarded.split(",")[0].trim();
    }
    return request.getRemoteAddr();
  }
}