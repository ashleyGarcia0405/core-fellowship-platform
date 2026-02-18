package edu.columbia.corefellowship.applications.dto;

import edu.columbia.corefellowship.applications.model.MatchPreference;

import java.util.List;

public class UpdateMatchPreferenceRequest {

  private List<MatchPreference.RoleReference> rankedRoles;

  private String notes;

  private Boolean submit; // true = finalize submission

  public List<MatchPreference.RoleReference> getRankedRoles() {
    return rankedRoles;
  }

  public void setRankedRoles(List<MatchPreference.RoleReference> rankedRoles) {
    this.rankedRoles = rankedRoles;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }

  public Boolean getSubmit() {
    return submit;
  }

  public void setSubmit(Boolean submit) {
    this.submit = submit;
  }
}
