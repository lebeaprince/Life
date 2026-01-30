package com.nimbus.catalog.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(
    name = "catalog_inventory_adjustments",
    indexes = {
        @Index(name = "idx_catalog_adjustments_tenant", columnList = "tenant_id"),
        @Index(name = "idx_catalog_adjustments_product", columnList = "product_id")
    }
)
public class InventoryAdjustment {
  @Id
  @Column(name = "id", nullable = false, updatable = false)
  private String id;

  @Column(name = "tenant_id", nullable = false)
  private String tenantId;

  @Column(name = "product_id", nullable = false)
  private String productId;

  private int delta;
  private String reason;
  private String createdBy;
  private Instant createdAt;

  protected InventoryAdjustment() {}

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
