package com.nimbus.order.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;



@Entity
@Table(
    name = "order_orders",
    indexes = {
        @Index(name = "idx_order_orders_tenant", columnList = "tenant_id")
    }
)
public class Order {
  @Id
  @Column(name = "id", nullable = false, updatable = false)
  private String id;

  @Column(name = "tenant_id", nullable = false)
  private String tenantId;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(
      name = "order_order_items",
      joinColumns = @JoinColumn(name = "order_id")
  )
  @OrderColumn(name = "line_number")
  private List<OrderItem> items = new ArrayList<>();

  private double subtotal;
  private double tax;
  private double total;
  private String paymentType;
  private String status;
  private String createdBy;
  @Column(name = "created_at")
  private Instant createdAt;

  protected Order() {}

  public Order(String id, String tenantId) {
    this.id = id;
    this.tenantId = tenantId;
  }

  public String getId() {
    return id;
  }

  public String getTenantId() {
    return tenantId;
  }

  public List<OrderItem> getItems() {
    return items;
  }

  public void setItems(List<OrderItem> items) {
    this.items = items == null ? new ArrayList<>() : new ArrayList<>(items);
  }

  public double getSubtotal() {
    return subtotal;
  }

  public void setSubtotal(double subtotal) {
    this.subtotal = subtotal;
  }

  public double getTax() {
    return tax;
  }

  public void setTax(double tax) {
    this.tax = tax;
  }

  public double getTotal() {
    return total;
  }

  public void setTotal(double total) {
    this.total = total;
  }

  public String getPaymentType() {
    return paymentType;
  }

  public void setPaymentType(String paymentType) {
    this.paymentType = paymentType;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
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
