package com.nimbus.identity.controller;

import com.nimbus.identity.config.RequestContext;
import com.nimbus.identity.model.User;
import com.nimbus.identity.store.IdentityStore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private static final DateTimeFormatter ISO_FORMATTER =
      DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC);

  private final IdentityStore identityStore;

  public UserController(IdentityStore identityStore) {
    this.identityStore = identityStore;
  }

  @GetMapping
  public List<UserProfile> listUsers() {
    String tenantId = RequestContext.require().tenantId();
    return identityStore.listUsersForTenant(tenantId).stream()
        .map(this::toProfile)
        .collect(Collectors.toList());
  }

  @PatchMapping("/{userId}/roles")
  public UserProfile updateRoles(
      @PathVariable String userId,
      @Valid @RequestBody RolesRequest request
  ) {
    User existing = identityStore.findUser(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    if (!RequestContext.require().tenantId().equals(existing.getTenantId())) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    }
    User updated = identityStore.updateRoles(userId, request.roles());
    return toProfile(updated);
  }

  @PatchMapping("/{userId}/display-name")
  public UserProfile updateDisplayName(
      @PathVariable String userId,
      @Valid @RequestBody DisplayNameRequest request
  ) {
    User existing = identityStore.findUser(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    if (!RequestContext.require().tenantId().equals(existing.getTenantId())) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    }
    User updated = identityStore.updateDisplayName(userId, request.displayName());
    return toProfile(updated);
  }

  private UserProfile toProfile(User user) {
    String createdAt = user.getCreatedAt() == null ? null : ISO_FORMATTER.format(user.getCreatedAt());
    return new UserProfile(
        user.getId(),
        user.getEmail(),
        user.getDisplayName(),
        user.getTenantId(),
        user.getRoles(),
        createdAt
    );
  }

  public record RolesRequest(List<String> roles) {}

  public record DisplayNameRequest(@NotBlank String displayName) {}

  public record UserProfile(
      String uid,
      String email,
      String displayName,
      String tenantId,
      List<String> roles,
      String createdAt
  ) {}
}
