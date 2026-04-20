package edu.columbia.corefellowship.applications.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "interview_bookings")
@CompoundIndexes({
    @CompoundIndex(name = "idx_term_email", def = "{'term':1,'studentEmail':1}")
})
public class InterviewBooking {

  @Id
  private String id;

  @Indexed(unique = true)
  private String calBookingUid;

  private String applicationId;
  private String term;
  private String studentName;
  private String studentEmail;
  private String interviewType; // technical | non-technical
  private Instant startTime;
  private Instant endTime;
  private String status; // scheduled | cancelled | completed
  private String eventType;
  private String title;

  private List<InterviewerAssignment> interviewers = new ArrayList<>();

  private Instant createdAt;
  private Instant updatedAt;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getCalBookingUid() {
    return calBookingUid;
  }

  public void setCalBookingUid(String calBookingUid) {
    this.calBookingUid = calBookingUid;
  }

  public String getApplicationId() {
    return applicationId;
  }

  public void setApplicationId(String applicationId) {
    this.applicationId = applicationId;
  }

  public String getTerm() {
    return term;
  }

  public void setTerm(String term) {
    this.term = term;
  }

  public String getStudentName() {
    return studentName;
  }

  public void setStudentName(String studentName) {
    this.studentName = studentName;
  }

  public String getStudentEmail() {
    return studentEmail;
  }

  public void setStudentEmail(String studentEmail) {
    this.studentEmail = studentEmail;
  }

  public String getInterviewType() {
    return interviewType;
  }

  public void setInterviewType(String interviewType) {
    this.interviewType = interviewType;
  }

  public Instant getStartTime() {
    return startTime;
  }

  public void setStartTime(Instant startTime) {
    this.startTime = startTime;
  }

  public Instant getEndTime() {
    return endTime;
  }

  public void setEndTime(Instant endTime) {
    this.endTime = endTime;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public String getEventType() {
    return eventType;
  }

  public void setEventType(String eventType) {
    this.eventType = eventType;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public List<InterviewerAssignment> getInterviewers() {
    return interviewers;
  }

  public void setInterviewers(List<InterviewerAssignment> interviewers) {
    this.interviewers = interviewers;
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
