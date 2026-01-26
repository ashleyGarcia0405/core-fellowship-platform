package edu.columbia.corefellowship.applications.model;

public enum ApplicationStatus {
  SUBMITTED,           // Initial state after application submission
  INTERVIEW_SCHEDULED, // Admin scheduled interview (optional intermediate state)
  INTERVIEWED,         // Interview completed, awaiting finalist decision
  FINALIST,            // Selected as finalist (can now submit preferences)
  REJECTED,            // Not selected as finalist
  MATCHED,             // Successfully matched to startup
  NOT_MATCHED          // Finalist but no match found
}