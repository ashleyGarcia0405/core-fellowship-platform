package edu.columbia.corefellowship.identity.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

  private String secret;
  private String issuer;
  private String audience;
  private Integer expirationHours = 24;

  // Getters and Setters
  public String getSecret() {
    return secret;
  }

  public void setSecret(String secret) {
    this.secret = secret;
  }

  public String getIssuer() {
    return issuer;
  }

  public void setIssuer(String issuer) {
    this.issuer = issuer;
  }

  public String getAudience() {
    return audience;
  }

  public void setAudience(String audience) {
    this.audience = audience;
  }

  public Integer getExpirationHours() {
    return expirationHours;
  }

  public void setExpirationHours(Integer expirationHours) {
    this.expirationHours = expirationHours;
  }
}