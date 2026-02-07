package com.nimbus.identity.store;

import com.nimbus.identity.model.Tenant;
import com.nimbus.identity.model.User;
import com.nimbus.identity.repository.TenantRepository;
import com.nimbus.identity.repository.UserRepository;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
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
    String normalizedEmail = normalizeEmail(email);
    if (normalizedEmail == null || normalizedEmail.isBlank()) {
      throw new IllegalArgumentException("Email is required");
    }
    if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
      throw new IllegalArgumentException("Email already exists");
    }
    String tenantId = UUID.randomUUID().toString();
    String userId = UUID.randomUUID().toString();

    Tenant tenant = new Tenant(tenantId);
    tenant.setName(normalizeName(tenantName));
    tenant.setPlan("starter");
    tenant.setOwnerUid(userId);
    tenant.setCreatedAt(Instant.now());
    tenantRepository.save(tenant);

    User user = new User(userId);
    user.setEmail(normalizedEmail);
    user.setPasswordHash(passwordEncoder.encode(password));
    user.setDisplayName(normalizeName(displayName));
    user.setTenantId(tenantId);
    user.setRoles(List.of("owner"));
    user.setCreatedAt(Instant.now());
    try {
      return userRepository.save(user);
    } catch (DataIntegrityViolationException ex) {
      throw new IllegalArgumentException("Email already exists", ex);
    }
  }

  @Transactional
  public Optional<User> authenticate(String email, String password) {
    System.out.println("Store::::::" + email);
    String normalizedEmail = normalizeEmail(email);
    if (normalizedEmail == null || normalizedEmail.isBlank()) {
      return Optional.empty();
    }
    Optional<User> user = userRepository.findByEmailIgnoreCase(normalizedEmail);
    if (user.isEmpty()) {
      return Optional.empty();
    }
    User candidate = user.get();
    String storedHash = candidate.getPasswordHash();
    if (storedHash == null || storedHash.isBlank()) {
      return Optional.empty();
    }
    if (looksLikeBcryptHash(storedHash)) {
      try {
        if (!passwordEncoder.matches(password, storedHash)) {
          return Optional.empty();
        }
      } catch (IllegalArgumentException ex) {
        return Optional.empty();
      }
      return Optional.of(candidate);
    }
    if (!storedHash.equals(password)) {
      return Optional.empty();
    }
    candidate.setPasswordHash(passwordEncoder.encode(password));
    userRepository.save(candidate);
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

  private static String normalizeEmail(String email) {
    if (email == null) {
      return null;
    }
    return email.trim().toLowerCase(Locale.ROOT);
  }

  private static String normalizeName(String value) {
    return value == null ? null : value.trim();
  }

  private static boolean looksLikeBcryptHash(String value) {
    if (value == null) {
      return false;
    }
    return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
  }
}
