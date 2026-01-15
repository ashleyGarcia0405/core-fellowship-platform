package edu.columbia.corefellowship.identity.repository;

import edu.columbia.corefellowship.identity.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

  Optional<User> findByEmail(String email);

  Boolean existsByEmail(String email);
}
