package com.nimbus.identity.store;

import com.nimbus.identity.model.Tenant;
import com.nimbus.identity.model.User;
import com.nimbus.identity.repository.TenantRepository;
import com.nimbus.identity.repository.UserRepository;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class IdentityStore {
  private final UserRepository userRepository;
  private final TenantRepository tenantRepository;
  private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  public IdentityStore(UserRepository userRepository, TenantRepository tenantRepository) {
    this.userRepository = userRepository;
    this.tenantRepository = tenantRepository;
  }

  @Transactional
  public User register(
      String email,
      String password,
      String displayName,
      String tenantName
  ) {
    String normalizedEmail = email.toLowerCase();
    if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
      throw new IllegalArgumentException("Email already exists");
    }
    String tenantId = UUID.randomUUID().toString();
    String userId = UUID.randomUUID().toString();

    Tenant tenant = new Tenant(tenantId);
    tenant.setName(tenantName);
    tenant.setPlan("starter");
    tenant.setOwnerUid(userId);
    tenant.setCreatedAt(Instant.now());
    tenantRepository.save(tenant);

    User user = new User(userId);
    user.setEmail(normalizedEmail);
    user.setPasswordHash(passwordEncoder.encode(password));
    user.setDisplayName(displayName);
    user.setTenantId(tenantId);
    user.setRoles(List.of("owner"));
    user.setCreatedAt(Instant.now());
    try {
      return userRepository.save(user);
    } catch (DataIntegrityViolationException ex) {
      throw new IllegalArgumentException("Email already exists", ex);
    }
  }

  public Optional<User> authenticate(String email, String password) {
    System.out.println("Store::::::"+email);
    Optional<User> user = userRepository.findByEmailIgnoreCase(email.toLowerCase());
    if (user.isEmpty()) {
      return Optional.empty();
    }
    User candidate = user.get();
    if (!passwordEncoder.matches(password, candidate.getPasswordHash())) {
      return Optional.empty();
    }
    return Optional.of(candidate);
  }

  public Optional<User> findUser(String userId) {
    return userRepository.findById(userId);
  }

  public List<User> listUsersForTenant(String tenantId) {
    List<User> users = userRepository.findByTenantId(tenantId);
    users.sort(Comparator.comparing(User::getDisplayName, String.CASE_INSENSITIVE_ORDER));
    return users;
  }

  @Transactional
  public User updateRoles(String userId, List<String> roles) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
    user.setRoles(roles);
    return userRepository.save(user);
  }

  @Transactional
  public User updateDisplayName(String userId, String displayName) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
    user.setDisplayName(displayName);
    return userRepository.save(user);
  }

  public Optional<Tenant> findTenant(String tenantId) {
    return tenantRepository.findById(tenantId);
  }
}
