package com.nimbus.identity.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class User {
  private final String id;
  private String email;
  private String passwordHash;
  private String displayName;
  private String tenantId;
  private List<String> roles = new ArrayList<>();
  private Instant createdAt;

  public User(String id) {
    this.id = id;
  }

  public String getId() {
    return id;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public String getDisplayName() {
    return displayName;
  }

  public void setDisplayName(String displayName) {
    this.displayName = displayName;
  }

  public String getTenantId() {
    return tenantId;
  }

  public void setTenantId(String tenantId) {
    this.tenantId = tenantId;
  }

  public List<String> getRoles() {
    return roles;
  }

  public void setRoles(List<String> roles) {
    this.roles = roles == null ? new ArrayList<>() : new ArrayList<>(roles);
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}
