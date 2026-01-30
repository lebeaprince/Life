package com.nimbus.identity.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(
    name = "identity_tenants",
    indexes = {
        @Index(name = "idx_identity_tenants_owner", columnList = "owner_uid")
    }
)
public class Tenant {
  @Id
  @Column(name = "id", nullable = false, updatable = false)
  private String id;

  @Column(name = "name")
  private String name;

  @Column(name = "plan")
  private String plan;

  @Column(name = "owner_uid")
  private String ownerUid;

  @Column(name = "created_at")
  private Instant createdAt;

  protected Tenant() {}

  public Tenant(String id) {
    this.id = id;
  }

  public String getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getPlan() {
    return plan;
  }

  public void setPlan(String plan) {
    this.plan = plan;
  }

  public String getOwnerUid() {
    return ownerUid;
  }

  public void setOwnerUid(String ownerUid) {
    this.ownerUid = ownerUid;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}
