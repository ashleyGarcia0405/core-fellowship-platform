package edu.columbia.corefellowship.applications.repository;

import edu.columbia.corefellowship.applications.model.MatchPreference;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchPreferenceRepository extends MongoRepository<MatchPreference, String> {

  Optional<MatchPreference> findByApplicationId(String applicationId);

  boolean existsByApplicationId(String applicationId);

  List<MatchPreference> findBySubmitted(boolean submitted);
}
