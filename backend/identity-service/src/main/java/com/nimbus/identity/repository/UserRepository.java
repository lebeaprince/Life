package com.nimbus.identity.repository;

import com.nimbus.identity.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
  Optional<User> findByEmailIgnoreCase(String email);

  boolean existsByEmailIgnoreCase(String email);

  List<User> findByTenantId(String tenantId);

  User save(User user);

  Optional<User> findById(String userId);
}
