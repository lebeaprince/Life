package com.nimbus.identity.store;

import com.nimbus.identity.model.Tenant;
import com.nimbus.identity.model.User;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class IdentityStore {
  private final Map<String, User> usersById = new ConcurrentHashMap<>();
  private final Map<String, String> userIdByEmail = new ConcurrentHashMap<>();
  private final Map<String, Tenant> tenantsById = new ConcurrentHashMap<>();
  private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  public synchronized User register(
      String email,
      String password,
      String displayName,
      String tenantName
  ) {
    if (userIdByEmail.containsKey(email.toLowerCase())) {
      throw new IllegalArgumentException("Email already exists");
    }
    String tenantId = UUID.randomUUID().toString();
    String userId = UUID.randomUUID().toString();

    Tenant tenant = new Tenant(tenantId);
    tenant.setName(tenantName);
    tenant.setPlan("starter");
    tenant.setOwnerUid(userId);
    tenant.setCreatedAt(Instant.now());
    tenantsById.put(tenantId, tenant);

    User user = new User(userId);
    user.setEmail(email.toLowerCase());
    user.setPasswordHash(passwordEncoder.encode(password));
    user.setDisplayName(displayName);
    user.setTenantId(tenantId);
    user.setRoles(List.of("owner"));
    user.setCreatedAt(Instant.now());
    usersById.put(userId, user);
    userIdByEmail.put(email.toLowerCase(), userId);

    return user;
  }

  public Optional<User> authenticate(String email, String password) {
    String userId = userIdByEmail.get(email.toLowerCase());
    if (userId == null) {
      return Optional.empty();
    }
    User user = usersById.get(userId);
    if (user == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
      return Optional.empty();
    }
    return Optional.of(user);
  }

  public Optional<User> findUser(String userId) {
    return Optional.ofNullable(usersById.get(userId));
  }

  public List<User> listUsersForTenant(String tenantId) {
    List<User> users = new ArrayList<>();
    for (User user : usersById.values()) {
      if (tenantId.equals(user.getTenantId())) {
        users.add(user);
      }
    }
    users.sort(Comparator.comparing(User::getDisplayName, String.CASE_INSENSITIVE_ORDER));
    return users;
  }

  public User updateRoles(String userId, List<String> roles) {
    User user = usersById.get(userId);
    if (user == null) {
      throw new IllegalArgumentException("User not found");
    }
    user.setRoles(roles);
    return user;
  }

  public User updateDisplayName(String userId, String displayName) {
    User user = usersById.get(userId);
    if (user == null) {
      throw new IllegalArgumentException("User not found");
    }
    user.setDisplayName(displayName);
    return user;
  }

  public Optional<Tenant> findTenant(String tenantId) {
    return Optional.ofNullable(tenantsById.get(tenantId));
  }
}
