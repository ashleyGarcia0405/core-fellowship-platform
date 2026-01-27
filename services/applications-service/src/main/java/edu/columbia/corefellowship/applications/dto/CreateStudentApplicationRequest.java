package edu.columbia.corefellowship.applications.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CreateStudentApplicationRequest {

  // Personal Information
  @NotBlank(message = "Full name is required")
  private String fullName;

  private String pronouns;

  @NotBlank(message = "Graduation year is required")
  private String gradYear; // 2026, 2027, 2028, 2029

  private String school;

  @NotBlank(message = "Major is required")
  private String major;

  @NotBlank(message = "Email is required")
  @Email(message = "Email must be valid")
  private String email;

  private String linkedinProfile;
  private String portfolioWebsite; // Portfolio/Personal Website/Github

  private String resumeUrl; // PDF URL or file path (optional - can be uploaded later)

  // Discovery
  private String howDidYouHear; // Website, Word-of-mouth, Previous Fellow, etc.
  private String referralSource; // If word-of-mouth/previous fellow, who?

  // Role Preferences (multiple selection)
  private List<String> rolePreferences; // Creative, Business, Tech

  // Short Answer Questions
  @NotBlank(message = "Startups and industries is required")
  private String startupsAndIndustries; // Startups/industries interested in and why

  @NotBlank(message = "Contribution and experience is required")
  private String contributionAndExperience; // What they can contribute + project experience

  @NotBlank(message = "Work mode is required")
  private String workMode; // Hybrid, Remote, In person (NYC), Anything

  @NotBlank(message = "Time commitment is required")
  private String timeCommitment; // Days/hours available for internship

  @NotBlank(message = "US citizen status is required")
  private String isUSCitizen; // Yes/No

  private String workAuthorization; // If not US citizen, visa/work auth details

  // Miscellaneous
  private String additionalComments;

  @NotNull(message = "Previously applied status is required")
  private Boolean previouslyApplied;

  private Boolean previouslyParticipated;

  @NotNull(message = "Upcoming internship offers status is required")
  private Boolean hasUpcomingInternshipOffers;

  // Getters and Setters
  public String getFullName() {
    return fullName;
  }

  public void setFullName(String fullName) {
    this.fullName = fullName;
  }

  public String getPronouns() {
    return pronouns;
  }

  public void setPronouns(String pronouns) {
    this.pronouns = pronouns;
  }

  public String getGradYear() {
    return gradYear;
  }

  public void setGradYear(String gradYear) {
    this.gradYear = gradYear;
  }

  public String getSchool() {
    return school;
  }

  public void setSchool(String school) {
    this.school = school;
  }

  public String getMajor() {
    return major;
  }

  public void setMajor(String major) {
    this.major = major;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getLinkedinProfile() {
    return linkedinProfile;
  }

  public void setLinkedinProfile(String linkedinProfile) {
    this.linkedinProfile = linkedinProfile;
  }

  public String getPortfolioWebsite() {
    return portfolioWebsite;
  }

  public void setPortfolioWebsite(String portfolioWebsite) {
    this.portfolioWebsite = portfolioWebsite;
  }

  public String getResumeUrl() {
    return resumeUrl;
  }

  public void setResumeUrl(String resumeUrl) {
    this.resumeUrl = resumeUrl;
  }

  public String getHowDidYouHear() {
    return howDidYouHear;
  }

  public void setHowDidYouHear(String howDidYouHear) {
    this.howDidYouHear = howDidYouHear;
  }

  public String getReferralSource() {
    return referralSource;
  }

  public void setReferralSource(String referralSource) {
    this.referralSource = referralSource;
  }

  public List<String> getRolePreferences() {
    return rolePreferences;
  }

  public void setRolePreferences(List<String> rolePreferences) {
    this.rolePreferences = rolePreferences;
  }

  public String getStartupsAndIndustries() {
    return startupsAndIndustries;
  }

  public void setStartupsAndIndustries(String startupsAndIndustries) {
    this.startupsAndIndustries = startupsAndIndustries;
  }

  public String getContributionAndExperience() {
    return contributionAndExperience;
  }

  public void setContributionAndExperience(String contributionAndExperience) {
    this.contributionAndExperience = contributionAndExperience;
  }

  public String getWorkMode() {
    return workMode;
  }

  public void setWorkMode(String workMode) {
    this.workMode = workMode;
  }

  public String getTimeCommitment() {
    return timeCommitment;
  }

  public void setTimeCommitment(String timeCommitment) {
    this.timeCommitment = timeCommitment;
  }

  public String getIsUSCitizen() {
    return isUSCitizen;
  }

  public void setIsUSCitizen(String isUSCitizen) {
    this.isUSCitizen = isUSCitizen;
  }

  public String getWorkAuthorization() {
    return workAuthorization;
  }

  public void setWorkAuthorization(String workAuthorization) {
    this.workAuthorization = workAuthorization;
  }

  public String getAdditionalComments() {
    return additionalComments;
  }

  public void setAdditionalComments(String additionalComments) {
    this.additionalComments = additionalComments;
  }

  public Boolean getPreviouslyApplied() {
    return previouslyApplied;
  }

  public void setPreviouslyApplied(Boolean previouslyApplied) {
    this.previouslyApplied = previouslyApplied;
  }

  public Boolean getPreviouslyParticipated() {
    return previouslyParticipated;
  }

  public void setPreviouslyParticipated(Boolean previouslyParticipated) {
    this.previouslyParticipated = previouslyParticipated;
  }

  public Boolean getHasUpcomingInternshipOffers() {
    return hasUpcomingInternshipOffers;
  }

  public void setHasUpcomingInternshipOffers(Boolean hasUpcomingInternshipOffers) {
    this.hasUpcomingInternshipOffers = hasUpcomingInternshipOffers;
  }
}