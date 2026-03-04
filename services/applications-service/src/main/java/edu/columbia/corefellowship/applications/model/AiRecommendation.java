package edu.columbia.corefellowship.applications.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "ai_recommendations")
public class AiRecommendation {

  @Id
  private String id;

  @Indexed(unique = true)
  private String applicationId;

  private List<RoleScore> roleScores;

  private Instant generatedAt;
  private Instant updatedAt;

  public static class RoleScore {
    private String startupId;
    private int positionIndex;
    private String startupName;
    private String roleType;
    private int score;
    private String reasoning;

    public RoleScore() {
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

    public int getScore() {
      return score;
    }

    public void setScore(int score) {
      this.score = score;
    }

    public String getReasoning() {
      return reasoning;
    }

    public void setReasoning(String reasoning) {
      this.reasoning = reasoning;
    }
  }

  public AiRecommendation() {
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

  public List<RoleScore> getRoleScores() {
    return roleScores;
  }

  public void setRoleScores(List<RoleScore> roleScores) {
    this.roleScores = roleScores;
  }

  public Instant getGeneratedAt() {
    return generatedAt;
  }

  public void setGeneratedAt(Instant generatedAt) {
    this.generatedAt = generatedAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}
