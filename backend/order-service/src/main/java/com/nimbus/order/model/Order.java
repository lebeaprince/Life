package com.nimbus.order.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class Order {
  private final String id;
  private final String tenantId;
  private List<OrderItem> items = new ArrayList<>();
  private double subtotal;
  private double tax;
  private double total;
  private String paymentType;
  private String status;
  private String createdBy;
  private Instant createdAt;

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
