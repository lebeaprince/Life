package com.nimbus.catalog.model;

import java.time.Instant;

public class InventoryAdjustment {
  private final String id;
  private final String tenantId;
  private final String productId;
  private int delta;
  private String reason;
  private String createdBy;
  private Instant createdAt;

  public InventoryAdjustment(String id, String tenantId, String productId) {
    this.id = id;
    this.tenantId = tenantId;
    this.productId = productId;
  }

  public String getId() {
    return id;
  }

  public String getTenantId() {
    return tenantId;
  }

  public String getProductId() {
    return productId;
  }

  public int getDelta() {
    return delta;
  }

  public void setDelta(int delta) {
    this.delta = delta;
  }

  public String getReason() {
    return reason;
  }

  public void setReason(String reason) {
    this.reason = reason;
  }

  public String getCreatedBy() {
    return createdBy;
  }

  public void setCreatedBy(String createdBy) {
    this.createdBy = createdBy;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}
