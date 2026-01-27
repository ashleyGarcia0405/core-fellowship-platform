package edu.columbia.corefellowship.gateway;

import edu.columbia.corefellowship.gateway.security.JwtAuthenticationFilter;
import edu.columbia.corefellowship.gateway.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.NegatedRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  private static OncePerRequestFilter chainMarkerFilter(String chainName) {
    return new OncePerRequestFilter() {
      @Override
      protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
          throws ServletException, IOException {
        response.setHeader("X-Security-Chain", chainName);
        filterChain.doFilter(request, response);
      }
    };
  }

  private static OncePerRequestFilter chainStatusFilter(String chainName) {
    return new OncePerRequestFilter() {
      @Override
      protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
          throws ServletException, IOException {
        filterChain.doFilter(request, response);
        response.setHeader("X-Post-Chain-Status", String.valueOf(response.getStatus()));
        System.out.println(">>> " + chainName + " CHAIN RESPONSE " + response.getStatus() + " " + request.getMethod() + " " + request.getRequestURI());
      }
    };
  }

  private RequestMatcher publicEndpointsMatcher() {
    return new OrRequestMatcher(
        new AntPathRequestMatcher("/v1/auth/**"),
        new AntPathRequestMatcher("/v1/identity/health"),
        new AntPathRequestMatcher("/health")
    );
  }

  // Public endpoints chain - handles /v1/auth/** and /health without JWT
  @Bean
  @Order(1)
  public SecurityFilterChain publicSecurityFilterChain(HttpSecurity http) throws Exception {
    http
      .securityMatcher(publicEndpointsMatcher())
      .addFilterBefore(chainMarkerFilter("public"), SecurityContextHolderFilter.class)
      .addFilterAfter(chainStatusFilter("PUBLIC"), SecurityContextHolderFilter.class)
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      .csrf(csrf -> csrf.disable())
      .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
      .sessionManagement(session ->
        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
      )
      .exceptionHandling(ex -> ex
        .authenticationEntryPoint((req, res, e) -> {
          System.out.println(">>> PUBLIC CHAIN ENTRYPOINT (401) " + e.getClass().getName() + ": " + e.getMessage());
          res.addHeader("X-Security-Error", "public-entrypoint");
          res.addHeader("X-Security-Error-Class", e.getClass().getName());
          res.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        })
        .accessDeniedHandler((req, res, e) -> {
          System.out.println(">>> PUBLIC CHAIN ACCESS DENIED (403) " + e.getClass().getName() + ": " + e.getMessage());
          res.addHeader("X-Security-Error", "public-access-denied");
          res.addHeader("X-Security-Error-Class", e.getClass().getName());
          res.sendError(HttpServletResponse.SC_FORBIDDEN);
        })
      );

    return http.build();
  }

  // Protected endpoints chain - handles all other requests with JWT authentication
  @Bean
  @Order(2)
  public SecurityFilterChain protectedSecurityFilterChain(
      HttpSecurity http,
      JwtUtil jwtUtil) throws Exception {
    JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtUtil);
    http
      .securityMatcher(new NegatedRequestMatcher(publicEndpointsMatcher()))
      .addFilterBefore(chainMarkerFilter("protected"), SecurityContextHolderFilter.class)
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      .csrf(csrf -> csrf.disable())
      .authorizeHttpRequests(auth -> auth
        // Public endpoints (defensive: permit even if protected chain is selected)
        .requestMatchers("/v1/auth/**", "/v1/identity/health", "/health").permitAll()
        // Admin-only endpoints
        .requestMatchers("/v1/export/**").hasRole("ADMIN")
        .requestMatchers("/v1/students/applications/*/status").hasRole("ADMIN")
        .requestMatchers("/v1/startups/*/status").hasRole("ADMIN")
        // All other endpoints require authentication
        .anyRequest().authenticated()
      )
      .sessionManagement(session ->
        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
      )
      .exceptionHandling(ex -> ex
        .authenticationEntryPoint((req, res, e) -> {
          System.out.println(">>> PROTECTED CHAIN ENTRYPOINT (401) " + e.getClass().getName() + ": " + e.getMessage());
          res.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        })
        .accessDeniedHandler((req, res, e) -> {
          System.out.println(">>> PROTECTED CHAIN ACCESS DENIED (403) " + e.getClass().getName() + ": " + e.getMessage());
          res.sendError(HttpServletResponse.SC_FORBIDDEN);
        })
      )
      .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // Allow requests from frontend origin
    configuration.setAllowedOrigins(Arrays.asList(
      "http://localhost:5173",
      "http://localhost:3000",
      "https://core-fellowship.vercel.app",
      "https://core-fellowship-evuj4bra7-ashley-garcias-projects.vercel.app"
    ));

    // Allow all HTTP methods
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

    // Allow all headers
    configuration.setAllowedHeaders(Arrays.asList("*"));

    // Disable credentials for stateless JWT auth (no cookies)
    configuration.setAllowCredentials(false);

    // Expose authorization header
    configuration.setExposedHeaders(Arrays.asList("Authorization"));

    // Max age for preflight requests (1 hour)
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);

    return source;
  }
}
