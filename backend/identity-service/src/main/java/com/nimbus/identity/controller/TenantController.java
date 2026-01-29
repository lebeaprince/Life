package com.nimbus.identity.controller;

import com.nimbus.identity.config.RequestContext;
import com.nimbus.identity.model.Tenant;
import com.nimbus.identity.store.IdentityStore;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {
  private static final DateTimeFormatter ISO_FORMATTER =
      DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC);

  private final IdentityStore identityStore;

  public TenantController(IdentityStore identityStore) {
    this.identityStore = identityStore;
  }

  @GetMapping("/me")
  public TenantProfile getTenant() {
    String tenantId = RequestContext.require().tenantId();
    Tenant tenant = identityStore.findTenant(tenantId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));
    String createdAt = tenant.getCreatedAt() == null ? null : ISO_FORMATTER.format(tenant.getCreatedAt());
    return new TenantProfile(
        tenant.getId(),
        tenant.getName(),
        tenant.getPlan(),
        tenant.getOwnerUid(),
        createdAt
    );
  }

  public record TenantProfile(
      String id,
      String name,
      String plan,
      String ownerUid,
      String createdAt
  ) {}
}
