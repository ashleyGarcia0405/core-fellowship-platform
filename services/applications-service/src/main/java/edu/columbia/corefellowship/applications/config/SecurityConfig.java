package edu.columbia.corefellowship.applications.config;

import edu.columbia.corefellowship.applications.security.UserHeaderAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  private final UserHeaderAuthenticationFilter userHeaderAuthenticationFilter;

  public SecurityConfig(UserHeaderAuthenticationFilter userHeaderAuthenticationFilter) {
    this.userHeaderAuthenticationFilter = userHeaderAuthenticationFilter;
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/health").permitAll()
        .anyRequest().authenticated()
      )
      .sessionManagement(session ->
        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
      )
      .csrf(csrf -> csrf.disable())
      .addFilterBefore(userHeaderAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}