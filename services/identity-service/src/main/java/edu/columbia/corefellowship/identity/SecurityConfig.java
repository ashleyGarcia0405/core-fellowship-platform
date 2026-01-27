package edu.columbia.corefellowship.identity;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      .authorizeHttpRequests(auth -> auth
        .requestMatchers(new AntPathRequestMatcher("/health")).permitAll()
        .requestMatchers(new AntPathRequestMatcher("/api/auth/**")).permitAll()
        .requestMatchers(new AntPathRequestMatcher("/error")).permitAll()
        .anyRequest().authenticated()
      )
      .sessionManagement(session ->
        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
      )
      .exceptionHandling(ex -> ex
        .authenticationEntryPoint((req, res, e) -> {
          System.out.println(">>> IDENTITY ENTRYPOINT (401) " + e.getClass().getName() + ": " + e.getMessage());
          res.addHeader("X-Security-Error", "identity-entrypoint");
          res.addHeader("X-Security-Error-Class", e.getClass().getName());
          res.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        })
        .accessDeniedHandler((req, res, e) -> {
          System.out.println(">>> IDENTITY ACCESS DENIED (403) " + e.getClass().getName() + ": " + e.getMessage());
          res.addHeader("X-Security-Error", "identity-access-denied");
          res.addHeader("X-Security-Error-Class", e.getClass().getName());
          res.sendError(HttpServletResponse.SC_FORBIDDEN);
        })
      )
      .csrf(csrf -> csrf.disable());

    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // Allow requests from gateway and frontend
    configuration.setAllowedOrigins(Arrays.asList(
      "http://localhost:8080",  // API Gateway
      "http://localhost:5173",  // Vite dev server
      "http://localhost:3000",  // Alternative frontend port
      "https://core-fellowship.vercel.app"  // Production frontend
    ));

    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);

    return source;
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }
}
