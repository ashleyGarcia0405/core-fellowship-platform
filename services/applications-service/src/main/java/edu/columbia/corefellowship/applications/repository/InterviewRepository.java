package edu.columbia.corefellowship.applications.repository;

import edu.columbia.corefellowship.applications.model.Interview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends MongoRepository<Interview, String> {

  // Find interview by application ID
  Optional<Interview> findByApplicationId(String applicationId);

  // Find all interviews by interviewer
  List<Interview> findByInterviewerId(String interviewerId);

  // Check if application has been interviewed
  boolean existsByApplicationId(String applicationId);
}