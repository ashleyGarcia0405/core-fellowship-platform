package edu.columbia.corefellowship.applications.dto;

import edu.columbia.corefellowship.applications.model.Recommendation;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.time.Instant;

public class UpdateInterviewRequest {

  private Instant interviewDate;

  // All fields are optional for update
  @Min(value = 1, message = "Score must be between 1 and 10")
  @Max(value = 10, message = "Score must be between 1 and 10")
  private Integer technicalScore;

  @Min(value = 1, message = "Score must be between 1 and 10")
  @Max(value = 10, message = "Score must be between 1 and 10")
  private Integer communicationScore;

  @Min(value = 1, message = "Score must be between 1 and 10")
  @Max(value = 10, message = "Score must be between 1 and 10")
  private Integer motivationScore;

  @Min(value = 1, message = "Score must be between 1 and 10")
  @Max(value = 10, message = "Score must be between 1 and 10")
  private Integer cultureFitScore;

  private String strengths;
  private String concerns;
  private String notes;
  private Recommendation recommendation;

  // Getters and Setters
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
}