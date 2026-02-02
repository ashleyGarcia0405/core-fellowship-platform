package edu.columbia.corefellowship.applications.dto;

import jakarta.validation.constraints.NotNull;

public class UpdateInterviewEligibilityRequest {

  @NotNull
  private Boolean interviewEligible;

  public Boolean getInterviewEligible() {
    return interviewEligible;
  }

  public void setInterviewEligible(Boolean interviewEligible) {
    this.interviewEligible = interviewEligible;
  }
}
