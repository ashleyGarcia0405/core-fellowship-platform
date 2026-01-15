package edu.columbia.corefellowship.applications.repository;

import edu.columbia.corefellowship.applications.model.Startup;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StartupRepository extends MongoRepository<Startup, String> {

  List<Startup> findByTerm(String term);

  List<Startup> findByStatus(String status);

  List<Startup> findByTermAndStatus(String term, String status);

  List<Startup> findByIndustry(String industry);

  // User-based queries for authentication
  List<Startup> findByUserId(String userId);

  List<Startup> findByUserIdAndTerm(String userId, String term);
}