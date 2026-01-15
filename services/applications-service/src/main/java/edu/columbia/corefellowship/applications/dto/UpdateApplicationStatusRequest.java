package edu.columbia.corefellowship.applications.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateApplicationStatusRequest {

  @NotBlank(message = "Status is required")
  private String status;

  private String reviewedBy;
  private String reviewNotes;

  // Getters and Setters
  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public String getReviewedBy() {
    return reviewedBy;
  }

  public void setReviewedBy(String reviewedBy) {
    this.reviewedBy = reviewedBy;
  }

  public String getReviewNotes() {
    return reviewNotes;
  }

  public void setReviewNotes(String reviewNotes) {
    this.reviewNotes = reviewNotes;
  }
}