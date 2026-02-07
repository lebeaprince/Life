package com.nimbus.order.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(
    name = "order_loyalty_members",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_order_loyalty_members_phone", columnNames = {"tenant_id", "phone_hash"})
    },
    indexes = {
        @Index(name = "idx_order_loyalty_members_tenant", columnList = "tenant_id")
    }
)
public class LoyaltyMember {
  @Id
  @Column(name = "id", nullable = false, updatable = false)
  private String id;

  @Column(name = "tenant_id", nullable = false)
  private String tenantId;

  @Column(name = "phone_hash", nullable = false)
  private String phoneHash;

  @Column(name = "phone_encrypted", nullable = false, length = 512)
  private String phoneEncrypted;

  @Column(name = "name_encrypted", length = 512)
  private String nameEncrypted;

  @Column(name = "points_balance")
  private int pointsBalance;

  @Column(name = "total_orders")
  private int totalOrders;

  @Column(name = "created_at")
  private Instant createdAt;

  @Column(name = "updated_at")
  private Instant updatedAt;

  protected LoyaltyMember() {}

  public LoyaltyMember(String id, String tenantId) {
    this.id = id;
    this.tenantId = tenantId;
  }

  public String getId() {
    return id;
  }

  public String getTenantId() {
    return tenantId;
  }

  public void setTenantId(String tenantId) {
    this.tenantId = tenantId;
  }

  public String getPhoneHash() {
    return phoneHash;
  }

  public void setPhoneHash(String phoneHash) {
    this.phoneHash = phoneHash;
  }

  public String getPhoneEncrypted() {
    return phoneEncrypted;
  }

  public void setPhoneEncrypted(String phoneEncrypted) {
    this.phoneEncrypted = phoneEncrypted;
  }

  public String getNameEncrypted() {
    return nameEncrypted;
  }

  public void setNameEncrypted(String nameEncrypted) {
    this.nameEncrypted = nameEncrypted;
  }

  public int getPointsBalance() {
    return pointsBalance;
  }

  public void setPointsBalance(int pointsBalance) {
    this.pointsBalance = pointsBalance;
  }

  public int getTotalOrders() {
    return totalOrders;
  }

  public void setTotalOrders(int totalOrders) {
    this.totalOrders = totalOrders;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}
