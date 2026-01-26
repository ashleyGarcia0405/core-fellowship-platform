package edu.columbia.corefellowship.applications.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "interviews")
public class Interview {

  @Id
  private String id;

  // Link to StudentApplication
  @Indexed
  private String applicationId;

  // Admin who conducted the interview
  private String interviewerId;
  private String interviewerName;

  private Instant interviewDate;

  // Scoring (1-10 scale)
  private Integer technicalScore;
  private Integer communicationScore;
  private Integer motivationScore;
  private Integer cultureFitScore;

  // Auto-calculated weighted average
  private Double overallScore;

  // Qualitative assessment
  private String strengths;
  private String concerns;
  private String notes;

  // Recommendation
  private Recommendation recommendation;

  // Timestamps
  private Instant createdAt;
  private Instant updatedAt;

  // Constructors
  public Interview() {
  }

  // Method to calculate overall score
  public void calculateOverallScore() {
    if (technicalScore != null && communicationScore != null &&
        motivationScore != null && cultureFitScore != null) {
      // Weighted average: technical 30%, communication 25%, motivation 25%, culture fit 20%
      this.overallScore = (technicalScore * 0.30) +
                         (communicationScore * 0.25) +
                         (motivationScore * 0.25) +
                         (cultureFitScore * 0.20);
    }
  }

  // Getters and Setters
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

  public String getInterviewerId() {
    return interviewerId;
  }

  public void setInterviewerId(String interviewerId) {
    this.interviewerId = interviewerId;
  }

  public String getInterviewerName() {
    return interviewerName;
  }

  public void setInterviewerName(String interviewerName) {
    this.interviewerName = interviewerName;
  }

  public Instant getInterviewDate() {
    return interviewDate;
  }

  public void setInterviewDate(Instant interviewDate) {
    this.interviewDate = interviewDate;
  }

  public Integer getTechnicalScore() {
    return technicalScore;
  }

  public void setTechnicalScore(Integer technicalScore) {
    this.technicalScore = technicalScore;
  }

  public Integer getCommunicationScore() {
    return communicationScore;
  }

  public void setCommunicationScore(Integer communicationScore) {
    this.communicationScore = communicationScore;
  }

  public Integer getMotivationScore() {
    return motivationScore;
  }

  public void setMotivationScore(Integer motivationScore) {
    this.motivationScore = motivationScore;
  }

  public Integer getCultureFitScore() {
    return cultureFitScore;
  }

  public void setCultureFitScore(Integer cultureFitScore) {
    this.cultureFitScore = cultureFitScore;
  }

  public Double getOverallScore() {
    return overallScore;
  }

  public void setOverallScore(Double overallScore) {
    this.overallScore = overallScore;
  }

  public String getStrengths() {
    return strengths;
  }

  public void setStrengths(String strengths) {
    this.strengths = strengths;
  }

  public String getConcerns() {
    return concerns;
  }

  public void setConcerns(String concerns) {
    this.concerns = concerns;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }

  public Recommendation getRecommendation() {
    return recommendation;
  }

  public void setRecommendation(Recommendation recommendation) {
    this.recommendation = recommendation;
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
}