package edu.columbia.corefellowship.applications.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "vc_portfolio_invites")
public class VcPortfolioInvite {

  @Id
  private String id;

  private String vcUserId;
  private String vcName;
  private String companyEmail;
  private String companyName;

  @Indexed(unique = true)
  private String token;

  private String status; // "pending" | "registered" | "expired"
  private Instant invitedAt;
  private Instant registeredAt;
  private Instant expiresAt;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }

  public String getVcUserId() { return vcUserId; }
  public void setVcUserId(String vcUserId) { this.vcUserId = vcUserId; }

  public String getVcName() { return vcName; }
  public void setVcName(String vcName) { this.vcName = vcName; }

  public String getCompanyEmail() { return companyEmail; }
  public void setCompanyEmail(String companyEmail) { this.companyEmail = companyEmail; }

  public String getCompanyName() { return companyName; }
  public void setCompanyName(String companyName) { this.companyName = companyName; }

  public String getToken() { return token; }
  public void setToken(String token) { this.token = token; }

  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }

  public Instant getInvitedAt() { return invitedAt; }
  public void setInvitedAt(Instant invitedAt) { this.invitedAt = invitedAt; }

  public Instant getRegisteredAt() { return registeredAt; }
  public void setRegisteredAt(Instant registeredAt) { this.registeredAt = registeredAt; }

  public Instant getExpiresAt() { return expiresAt; }
  public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
