package edu.columbia.corefellowship.applications.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "interviews")
public class Interview {

  @Id
  private String id;

  // Link to StudentApplication
  @Indexed
  private String applicationId;

  // Admin who conducted the interview
  private String interviewerId;
  private String interviewerName;

  private Instant interviewDate;

  // Role preferences
  private String primaryRoleInterest;
  private String secondaryRoleInterest;
  private String roleStructurePreference;

  // Startups & industries of interest
  private String startupInterests;

  // Contribution & experience
  private String skillsAndExperience;
  private String ambiguityExample;
  private String criticalFeedbackExample;

  // Work details
  private String workPreference;
  private String commitmentsAndConflicts;

  // Questions
  private String clarifyingQuestions;

  // Technical section
  private String technicalProjectOverview;
  private String technicalRebuildChanges;
  private String technicalDebuggingExample;
  private String technicalTestingApproach;
  private String technicalOnboardingApproach;

  // Non-technical section
  private String nonTechnicalOrganization;
  private String nonTechnicalFirstTwoWeeks;
  private String nonTechnicalCommunication;
  private String nonTechnicalProudProject;

  // Interviewer notes
  private String bestFitRoleOrStartup;
  private String likelihoodToAccept;
  private String commitmentConcerns;

  // Recommendation
  private Recommendation recommendation;

  // Timestamps
  private Instant createdAt;
  private Instant updatedAt;

  // Constructors
  public Interview() {
  }

  // Getters and Setters
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getApplicationId() {
    return applicationId;
  }

  public void setApplicationId(String applicationId) {
    this.applicationId = applicationId;
  }

  public String getInterviewerId() {
    return interviewerId;
  }

  public void setInterviewerId(String interviewerId) {
    this.interviewerId = interviewerId;
  }

  public String getInterviewerName() {
    return interviewerName;
  }

  public void setInterviewerName(String interviewerName) {
    this.interviewerName = interviewerName;
  }

  public Instant getInterviewDate() {
    return interviewDate;
  }

  public void setInterviewDate(Instant interviewDate) {
    this.interviewDate = interviewDate;
  }

  public String getPrimaryRoleInterest() {
    return primaryRoleInterest;
  }

  public void setPrimaryRoleInterest(String primaryRoleInterest) {
    this.primaryRoleInterest = primaryRoleInterest;
  }

  public String getSecondaryRoleInterest() {
    return secondaryRoleInterest;
  }

  public void setSecondaryRoleInterest(String secondaryRoleInterest) {
    this.secondaryRoleInterest = secondaryRoleInterest;
  }

  public String getRoleStructurePreference() {
    return roleStructurePreference;
  }

  public void setRoleStructurePreference(String roleStructurePreference) {
    this.roleStructurePreference = roleStructurePreference;
  }

  public String getStartupInterests() {
    return startupInterests;
  }

  public void setStartupInterests(String startupInterests) {
    this.startupInterests = startupInterests;
  }

  public String getSkillsAndExperience() {
    return skillsAndExperience;
  }

  public void setSkillsAndExperience(String skillsAndExperience) {
    this.skillsAndExperience = skillsAndExperience;
  }

  public String getAmbiguityExample() {
    return ambiguityExample;
  }

  public void setAmbiguityExample(String ambiguityExample) {
    this.ambiguityExample = ambiguityExample;
  }

  public String getCriticalFeedbackExample() {
    return criticalFeedbackExample;
  }

  public void setCriticalFeedbackExample(String criticalFeedbackExample) {
    this.criticalFeedbackExample = criticalFeedbackExample;
  }

  public String getWorkPreference() {
    return workPreference;
  }

  public void setWorkPreference(String workPreference) {
    this.workPreference = workPreference;
  }

  public String getCommitmentsAndConflicts() {
    return commitmentsAndConflicts;
  }

  public void setCommitmentsAndConflicts(String commitmentsAndConflicts) {
    this.commitmentsAndConflicts = commitmentsAndConflicts;
  }

  public String getClarifyingQuestions() {
    return clarifyingQuestions;
  }

  public void setClarifyingQuestions(String clarifyingQuestions) {
    this.clarifyingQuestions = clarifyingQuestions;
  }

  public String getTechnicalProjectOverview() {
    return technicalProjectOverview;
  }

  public void setTechnicalProjectOverview(String technicalProjectOverview) {
    this.technicalProjectOverview = technicalProjectOverview;
  }

  public String getTechnicalRebuildChanges() {
    return technicalRebuildChanges;
  }

  public void setTechnicalRebuildChanges(String technicalRebuildChanges) {
    this.technicalRebuildChanges = technicalRebuildChanges;
  }

  public String getTechnicalDebuggingExample() {
    return technicalDebuggingExample;
  }

  public void setTechnicalDebuggingExample(String technicalDebuggingExample) {
    this.technicalDebuggingExample = technicalDebuggingExample;
  }

  public String getTechnicalTestingApproach() {
    return technicalTestingApproach;
  }

  public void setTechnicalTestingApproach(String technicalTestingApproach) {
    this.technicalTestingApproach = technicalTestingApproach;
  }

  public String getTechnicalOnboardingApproach() {
    return technicalOnboardingApproach;
  }

  public void setTechnicalOnboardingApproach(String technicalOnboardingApproach) {
    this.technicalOnboardingApproach = technicalOnboardingApproach;
  }

  public String getNonTechnicalOrganization() {
    return nonTechnicalOrganization;
  }

  public void setNonTechnicalOrganization(String nonTechnicalOrganization) {
    this.nonTechnicalOrganization = nonTechnicalOrganization;
  }

  public String getNonTechnicalFirstTwoWeeks() {
    return nonTechnicalFirstTwoWeeks;
  }

  public void setNonTechnicalFirstTwoWeeks(String nonTechnicalFirstTwoWeeks) {
    this.nonTechnicalFirstTwoWeeks = nonTechnicalFirstTwoWeeks;
  }

  public String getNonTechnicalCommunication() {
    return nonTechnicalCommunication;
  }

  public void setNonTechnicalCommunication(String nonTechnicalCommunication) {
    this.nonTechnicalCommunication = nonTechnicalCommunication;
  }

  public String getNonTechnicalProudProject() {
    return nonTechnicalProudProject;
  }

  public void setNonTechnicalProudProject(String nonTechnicalProudProject) {
    this.nonTechnicalProudProject = nonTechnicalProudProject;
  }

  public String getBestFitRoleOrStartup() {
    return bestFitRoleOrStartup;
  }

  public void setBestFitRoleOrStartup(String bestFitRoleOrStartup) {
    this.bestFitRoleOrStartup = bestFitRoleOrStartup;
  }

  public String getLikelihoodToAccept() {
    return likelihoodToAccept;
  }

  public void setLikelihoodToAccept(String likelihoodToAccept) {
    this.likelihoodToAccept = likelihoodToAccept;
  }

  public String getCommitmentConcerns() {
    return commitmentConcerns;
  }

  public void setCommitmentConcerns(String commitmentConcerns) {
    this.commitmentConcerns = commitmentConcerns;
  }

  public Recommendation getRecommendation() {
    return recommendation;
  }

  public void setRecommendation(Recommendation recommendation) {
    this.recommendation = recommendation;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}
