package edu.columbia.corefellowship.applications.repository;

import edu.columbia.corefellowship.applications.model.VcPortfolioInvite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VcPortfolioInviteRepository extends MongoRepository<VcPortfolioInvite, String> {

  List<VcPortfolioInvite> findByVcUserId(String vcUserId);

  Optional<VcPortfolioInvite> findByToken(String token);
}
