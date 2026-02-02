package edu.columbia.corefellowship.applications.dto;

public class UpdateInterviewBookingRequest {
  private Boolean addInterviewer;
  private Boolean removeInterviewer;

  public Boolean getAddInterviewer() {
    return addInterviewer;
  }

  public void setAddInterviewer(Boolean addInterviewer) {
    this.addInterviewer = addInterviewer;
  }

  public Boolean getRemoveInterviewer() {
    return removeInterviewer;
  }

  public void setRemoveInterviewer(Boolean removeInterviewer) {
    this.removeInterviewer = removeInterviewer;
  }
}
