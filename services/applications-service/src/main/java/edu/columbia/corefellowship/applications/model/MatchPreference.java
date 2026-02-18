package edu.columbia.corefellowship.applications.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "match_preferences")
public class MatchPreference {

  @Id
  private String id;

  @Indexed(unique = true)
  private String applicationId;

  // Ordered list of role preferences — index 0 = top choice
  // Each entry references a specific position within a startup
  private List<RoleReference> rankedRoles;

  private String notes;

  private boolean submitted;

  // Set by admin during matching — which role the student is assigned to
  private RoleReference matchedRole;

  private Instant createdAt;
  private Instant updatedAt;
  private Instant submittedAt;

  // Nested class to identify a specific role/position at a startup
  public static class RoleReference {
    private String startupId;
    private int positionIndex; // index into Startup.positions list
    private String startupName; // denormalized for display convenience
    private String roleType; // denormalized from Position.roleType

    public RoleReference() {
    }

    public String getStartupId() {
      return startupId;
    }

    public void setStartupId(String startupId) {
      this.startupId = startupId;
    }

    public int getPositionIndex() {
      return positionIndex;
    }

    public void setPositionIndex(int positionIndex) {
      this.positionIndex = positionIndex;
    }

    public String getStartupName() {
      return startupName;
    }

    public void setStartupName(String startupName) {
      this.startupName = startupName;
    }

    public String getRoleType() {
      return roleType;
    }

    public void setRoleType(String roleType) {
      this.roleType = roleType;
    }
  }

  public MatchPreference() {
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getApplicationId() {
    return applicationId;
  }

  public void setApplicationId(String applicationId) {
    this.applicationId = applicationId;
  }

  public List<RoleReference> getRankedRoles() {
    return rankedRoles;
  }

  public void setRankedRoles(List<RoleReference> rankedRoles) {
    this.rankedRoles = rankedRoles;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }

  public boolean isSubmitted() {
    return submitted;
  }

  public void setSubmitted(boolean submitted) {
    this.submitted = submitted;
  }

  public RoleReference getMatchedRole() {
    return matchedRole;
  }

  public void setMatchedRole(RoleReference matchedRole) {
    this.matchedRole = matchedRole;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }

  public Instant getSubmittedAt() {
    return submittedAt;
  }

  public void setSubmittedAt(Instant submittedAt) {
    this.submittedAt = submittedAt;
  }
}
