package edu.columbia.corefellowship.gateway;

import edu.columbia.corefellowship.gateway.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthenticationFilter;

  public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      .authorizeHttpRequests(auth -> auth
        // Public endpoints
        .requestMatchers("/health", "/v1/auth/**").permitAll()
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
      .csrf(csrf -> csrf.disable())
      .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // Allow requests from frontend origin
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));

    // Allow all HTTP methods
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

    // Allow all headers
    configuration.setAllowedHeaders(Arrays.asList("*"));

    // Allow credentials (cookies, authorization headers, etc.)
    configuration.setAllowCredentials(true);

    // Expose authorization header
    configuration.setExposedHeaders(Arrays.asList("Authorization"));

    // Max age for preflight requests (1 hour)
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);

    return source;
  }
}