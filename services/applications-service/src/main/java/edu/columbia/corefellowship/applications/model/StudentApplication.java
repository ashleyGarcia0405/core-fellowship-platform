package edu.columbia.corefellowship.applications.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "student_applications")
public class StudentApplication {

  @Id
  private String id;

  // User ID from identity service (links to authenticated user)
  @Indexed
  private String userId;

  // Personal Information
  private String fullName;
  private String pronouns;
  private String gradYear; // 2026, 2027, 2028, 2029
  private String school;
  private String major;
  private String email;
  private String linkedinProfile;
  private String portfolioWebsite; // Portfolio/Personal Website/Github
  private String resumeUrl; // PDF URL or file path

  // Discovery
  private String howDidYouHear; // Website, Word-of-mouth, Previous Fellow, etc.
  private String referralSource; // If word-of-mouth/previous fellow, who?

  // Role Preferences (multiple selection)
  private List<String> rolePreferences; // Creative, Business, Tech

  // Short Answer Questions
  private String startupsAndIndustries; // Startups/industries interested in and why
  private String contributionAndExperience; // What they can contribute + project experience
  private String workMode; // Hybrid, Remote, In person (NYC), Anything
  private String timeCommitment; // Days/hours available for internship
  private String isUSCitizen; // Yes/No
  private String workAuthorization; // If not US citizen, visa/work auth details

  // Miscellaneous
  private String additionalComments;
  private Boolean previouslyApplied;
  private Boolean previouslyParticipated;
  private Boolean hasUpcomingInternshipOffers;

  // Administrative Fields (not visible to applicants)
  private String term; // e.g., "Fall 2025", "Spring 2026" - set by admin
  private String status; // e.g., "submitted", "under_review", "accepted", "rejected"
  private Instant submittedAt;
  private Instant updatedAt;
  private String reviewedBy;
  private String reviewNotes;

  // Constructors
  public StudentApplication() {
  }

  // Getters and Setters
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

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

  public String getTerm() {
    return term;
  }

  public void setTerm(String term) {
    this.term = term;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public Instant getSubmittedAt() {
    return submittedAt;
  }

  public void setSubmittedAt(Instant submittedAt) {
    this.submittedAt = submittedAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
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