package edu.columbia.corefellowship.applications.repository;

import edu.columbia.corefellowship.applications.model.VcFavorite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VcFavoriteRepository extends MongoRepository<VcFavorite, String> {

  List<VcFavorite> findByVcUserId(String vcUserId);

  Optional<VcFavorite> findByVcUserIdAndApplicationId(String vcUserId, String applicationId);

  boolean existsByVcUserIdAndApplicationId(String vcUserId, String applicationId);

  void deleteByVcUserIdAndApplicationId(String vcUserId, String applicationId);
}
