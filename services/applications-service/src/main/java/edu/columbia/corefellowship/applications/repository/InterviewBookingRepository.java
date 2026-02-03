package edu.columbia.corefellowship.applications.repository;

import edu.columbia.corefellowship.applications.model.InterviewBooking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewBookingRepository extends MongoRepository<InterviewBooking, String> {
  Optional<InterviewBooking> findByCalBookingUid(String calBookingUid);
  java.util.List<InterviewBooking> findByStudentEmail(String studentEmail);
}
