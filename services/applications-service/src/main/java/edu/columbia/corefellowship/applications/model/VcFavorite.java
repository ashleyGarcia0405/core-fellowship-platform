package edu.columbia.corefellowship.applications.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "vc_favorites")
@CompoundIndexes({
    @CompoundIndex(name = "idx_vcUserId_term", def = "{'vcUserId':1,'term':1}")
})
public class VcFavorite {

  @Id
  private String id;

  @Indexed
  private String vcUserId;

  @Indexed
  private String applicationId;

  private String term;
  private String notes;
  private String portfolioCompany;
  private Instant createdAt;
  private Instant updatedAt;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }

  public String getVcUserId() { return vcUserId; }
  public void setVcUserId(String vcUserId) { this.vcUserId = vcUserId; }

  public String getApplicationId() { return applicationId; }
  public void setApplicationId(String applicationId) { this.applicationId = applicationId; }

  public String getTerm() { return term; }
  public void setTerm(String term) { this.term = term; }

  public String getNotes() { return notes; }
  public void setNotes(String notes) { this.notes = notes; }

  public String getPortfolioCompany() { return portfolioCompany; }
  public void setPortfolioCompany(String portfolioCompany) { this.portfolioCompany = portfolioCompany; }

  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
