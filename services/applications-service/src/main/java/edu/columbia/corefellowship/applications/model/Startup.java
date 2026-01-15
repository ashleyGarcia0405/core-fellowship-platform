package edu.columbia.corefellowship.applications.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "startups")
public class Startup {

  @Id
  private String id;

  // User ID from identity service (links to authenticated user)
  @Indexed
  private String userId;

  // Company Info
  private String companyName;
  private String website; // Company Website / Online Presence
  private String industry;
  private String description; // Describe your company and product/service
  private String stage; // Stage of funding
  private String teamSize; // Approximate size of your team
  private String foundedYear;

  // Contact Info
  private String contactName; // Your name
  private String contactTitle; // Your role
  private String contactEmail; // Email address
  private String contactPhone; // Phone number

  // Operating Details
  private String operatingMode; // Hybrid, Fully Remote, Fully In Person
  private String timeZone; // If remote/hybrid, what time zone

  // Internship Details
  private String internsSupervisor; // Who will the interns be working under?
  private Boolean hasHiredInternsPreviously; // Have you hired student interns in the past?
  private Integer numberOfInternsNeeded; // How many interns are you looking for?
  private List<Position> positions; // Detailed position descriptions with skills
  private String willPayInterns; // Yes, No, Other
  private String payAmount; // Pay ($)
  private String lookingForPermanentIntern; // Yes, No, Other
  private String projectDescriptionUrl; // PDF with project descriptions

  // Discovery
  private String referralSource; // Who referred you to this program?

  // Commitment
  private Boolean commitmentAcknowledged; // Commit to accepting at least one fellow

  // Administrative Fields (not visible to applicants)
  private String term; // e.g., "Fall 2025", "Spring 2026" - set by admin
  private String status; // e.g., "submitted", "approved", "active", "inactive"
  private Instant submittedAt;
  private Instant updatedAt;
  private String reviewedBy;
  private String reviewNotes;

  // Nested class for positions
  public static class Position {
    private String roleType; // e.g., "Technical", "Business", "Creative"
    private String description; // Description of the role
    private List<String> requiredSkills; // Programming languages, specific experiences
    private String timeCommitment; // e.g., "10-15 hours/week"

    // Constructors
    public Position() {
    }

    // Getters and Setters
    public String getRoleType() {
      return roleType;
    }

    public void setRoleType(String roleType) {
      this.roleType = roleType;
    }

    public String getDescription() {
      return description;
    }

    public void setDescription(String description) {
      this.description = description;
    }

    public List<String> getRequiredSkills() {
      return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
      this.requiredSkills = requiredSkills;
    }

    public String getTimeCommitment() {
      return timeCommitment;
    }

    public void setTimeCommitment(String timeCommitment) {
      this.timeCommitment = timeCommitment;
    }
  }

  // Constructors
  public Startup() {
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