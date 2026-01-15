package edu.columbia.corefellowship.applications.dto;

import edu.columbia.corefellowship.applications.model.Startup.Position;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CreateStartupRequest {

  // Company Info
  @NotBlank(message = "Company name is required")
  private String companyName;

  private String website; // Company Website / Online Presence
  private String industry;
  private String description; // Describe your company and product/service
  private String stage; // Stage of funding
  private String teamSize; // Approximate size of your team
  private String foundedYear;

  // Contact Info
  @NotBlank(message = "Contact name is required")
  private String contactName; // Your name

  @NotBlank(message = "Contact title is required")
  private String contactTitle; // Your role

  @NotBlank(message = "Contact email is required")
  @Email(message = "Contact email must be valid")
  private String contactEmail; // Email address

  private String contactPhone; // Phone number

  // Operating Details
  @NotBlank(message = "Operating mode is required")
  private String operatingMode; // Hybrid, Fully Remote, Fully In Person

  private String timeZone; // If remote/hybrid, what time zone

  // Internship Details
  @NotBlank(message = "Interns supervisor is required")
  private String internsSupervisor; // Who will the interns be working under?

  @NotNull(message = "Previous intern hiring status is required")
  private Boolean hasHiredInternsPreviously; // Have you hired student interns in the past?

  private Integer numberOfInternsNeeded; // How many interns are you looking for?
  private List<Position> positions; // Detailed position descriptions with skills

  @NotBlank(message = "Will pay interns field is required")
  private String willPayInterns; // Yes, No, Other

  private String payAmount; // Pay ($)

  @NotBlank(message = "Looking for permanent intern field is required")
  private String lookingForPermanentIntern; // Yes, No, Other

  private String projectDescriptionUrl; // PDF with project descriptions

  // Discovery
  private String referralSource; // Who referred you to this program?

  // Commitment
  private Boolean commitmentAcknowledged; // Commit to accepting at least one fellow

  // Getters and Setters
  public String getCompanyName() {
    return companyName;
  }

  public void setCompanyName(String companyName) {
    this.companyName = companyName;
  }

  public String getWebsite() {
    return website;
  }

  public void setWebsite(String website) {
    this.website = website;
  }

  public String getIndustry() {
    return industry;
  }

  public void setIndustry(String industry) {
    this.industry = industry;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getStage() {
    return stage;
  }

  public void setStage(String stage) {
    this.stage = stage;
  }

  public String getTeamSize() {
    return teamSize;
  }

  public void setTeamSize(String teamSize) {
    this.teamSize = teamSize;
  }

  public String getFoundedYear() {
    return foundedYear;
  }

  public void setFoundedYear(String foundedYear) {
    this.foundedYear = foundedYear;
  }

  public String getContactName() {
    return contactName;
  }

  public void setContactName(String contactName) {
    this.contactName = contactName;
  }

  public String getContactTitle() {
    return contactTitle;
  }

  public void setContactTitle(String contactTitle) {
    this.contactTitle = contactTitle;
  }

  public String getContactEmail() {
    return contactEmail;
  }

  public void setContactEmail(String contactEmail) {
    this.contactEmail = contactEmail;
  }

  public String getContactPhone() {
    return contactPhone;
  }

  public void setContactPhone(String contactPhone) {
    this.contactPhone = contactPhone;
  }

  public String getOperatingMode() {
    return operatingMode;
  }

  public void setOperatingMode(String operatingMode) {
    this.operatingMode = operatingMode;
  }

  public String getTimeZone() {
    return timeZone;
  }

  public void setTimeZone(String timeZone) {
    this.timeZone = timeZone;
  }

  public String getInternsSupervisor() {
    return internsSupervisor;
  }

  public void setInternsSupervisor(String internsSupervisor) {
    this.internsSupervisor = internsSupervisor;
  }

  public Boolean getHasHiredInternsPreviously() {
    return hasHiredInternsPreviously;
  }

  public void setHasHiredInternsPreviously(Boolean hasHiredInternsPreviously) {
    this.hasHiredInternsPreviously = hasHiredInternsPreviously;
  }

  public Integer getNumberOfInternsNeeded() {
    return numberOfInternsNeeded;
  }

  public void setNumberOfInternsNeeded(Integer numberOfInternsNeeded) {
    this.numberOfInternsNeeded = numberOfInternsNeeded;
  }

  public List<Position> getPositions() {
    return positions;
  }

  public void setPositions(List<Position> positions) {
    this.positions = positions;
  }

  public String getWillPayInterns() {
    return willPayInterns;
  }

  public void setWillPayInterns(String willPayInterns) {
    this.willPayInterns = willPayInterns;
  }

  public String getPayAmount() {
    return payAmount;
  }

  public void setPayAmount(String payAmount) {
    this.payAmount = payAmount;
  }

  public String getLookingForPermanentIntern() {
    return lookingForPermanentIntern;
  }

  public void setLookingForPermanentIntern(String lookingForPermanentIntern) {
    this.lookingForPermanentIntern = lookingForPermanentIntern;
  }

  public String getProjectDescriptionUrl() {
    return projectDescriptionUrl;
  }

  public void setProjectDescriptionUrl(String projectDescriptionUrl) {
    this.projectDescriptionUrl = projectDescriptionUrl;
  }

  public String getReferralSource() {
    return referralSource;
  }

  public void setReferralSource(String referralSource) {
    this.referralSource = referralSource;
  }

  public Boolean getCommitmentAcknowledged() {
    return commitmentAcknowledged;
  }

  public void setCommitmentAcknowledged(Boolean commitmentAcknowledged) {
    this.commitmentAcknowledged = commitmentAcknowledged;
  }
}