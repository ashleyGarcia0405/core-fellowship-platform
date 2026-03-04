package edu.columbia.corefellowship.applications.repository;

import edu.columbia.corefellowship.applications.model.AiRecommendation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiRecommendationRepository extends MongoRepository<AiRecommendation, String> {
  Optional<AiRecommendation> findByApplicationId(String applicationId);
  boolean existsByApplicationId(String applicationId);
}
