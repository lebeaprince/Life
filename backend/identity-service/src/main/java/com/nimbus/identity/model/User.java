package com.nimbus.identity.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "identity_users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_identity_users_email", columnNames = "email")
    },
    indexes = {
        @Index(name = "idx_identity_users_tenant", columnList = "tenant_id")
    }
)
public class User {
  @Id
  @Column(name = "id", nullable = false, updatable = false)
  private String id;

  @Column(name = "email", nullable = false)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Column(name = "display_name")
  private String displayName;

  @Column(name = "tenant_id", nullable = false)
  private String tenantId;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(
      name = "identity_user_roles",
      joinColumns = @JoinColumn(name = "user_id")
  )
  @Column(name = "role", nullable = false)
  private List<String> roles = new ArrayList<>();

  @Column(name = "created_at")
  private Instant createdAt;

  protected User() {}

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
