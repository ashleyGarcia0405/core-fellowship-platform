package edu.columbia.corefellowship.applications.repository;

import edu.columbia.corefellowship.applications.model.StudentApplication;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentApplicationRepository extends MongoRepository<StudentApplication, String> {

  List<StudentApplication> findByTerm(String term);

  List<StudentApplication> findByStatus(String status);

  List<StudentApplication> findByTermAndStatus(String term, String status);

  List<StudentApplication> findByEmail(String email);

  // User-based queries for authentication
  List<StudentApplication> findByUserId(String userId);

  List<StudentApplication> findByUserIdAndTerm(String userId, String term);
}