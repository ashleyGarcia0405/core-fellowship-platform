package edu.columbia.corefellowship.applications.repository;

import edu.columbia.corefellowship.applications.model.InterviewBooking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewBookingRepository extends MongoRepository<InterviewBooking, String> {
  Optional<InterviewBooking> findByCalBookingUid(String calBookingUid);
  List<InterviewBooking> findByStudentEmail(String studentEmail);
  List<InterviewBooking> findByTerm(String term);
  List<InterviewBooking> findByTermAndStudentEmail(String term, String studentEmail);
  void deleteByApplicationId(String applicationId);
}
