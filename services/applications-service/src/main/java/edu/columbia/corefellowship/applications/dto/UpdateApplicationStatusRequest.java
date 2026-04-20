package edu.columbia.corefellowship.applications.dto;

import edu.columbia.corefellowship.applications.model.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateApplicationStatusRequest {

  @NotNull(message = "Status is required")
  private ApplicationStatus status;

  private String reviewedBy;
  private String reviewNotes;

  // Getters and Setters
  public ApplicationStatus getStatus() {
    return status;
  }

  public void setStatus(ApplicationStatus status) {
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