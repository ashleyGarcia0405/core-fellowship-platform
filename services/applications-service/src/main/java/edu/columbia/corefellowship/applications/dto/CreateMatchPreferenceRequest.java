package edu.columbia.corefellowship.applications.dto;

import edu.columbia.corefellowship.applications.model.MatchPreference;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CreateMatchPreferenceRequest {

  @NotNull(message = "Ranked roles list is required")
  private List<MatchPreference.RoleReference> rankedRoles;

  private String matchStatus;

  private String notes;

  private Boolean submit; // true = final submission, false/null = draft

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

  public String getMatchStatus() {
    return matchStatus;
  }

  public void setMatchStatus(String matchStatus) {
    this.matchStatus = matchStatus;
  }

  public Boolean getSubmit() {
    return submit;
  }

  public void setSubmit(Boolean submit) {
    this.submit = submit;
  }
}
