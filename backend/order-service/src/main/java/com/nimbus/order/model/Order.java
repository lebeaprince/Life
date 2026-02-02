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
        @Index(name = "idx_order_orders_tenant", columnList = "tenant_id"),
        @Index(name = "idx_order_orders_tenant_phone", columnList = "tenant_id, notification_phone_hash")
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
  @Column(name = "notification_enabled")
  private boolean notificationEnabled;
  @Column(name = "notification_customer_name")
  private String notificationCustomerName;
  @Column(name = "notification_phone_hash")
  private String notificationPhoneHash;
  @Column(name = "notification_phone_masked")
  private String notificationPhoneMasked;
  @Column(name = "notification_phone_encrypted", length = 512)
  private String notificationPhoneEncrypted;

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

  public boolean isNotificationEnabled() {
    return notificationEnabled;
  }

  public void setNotificationEnabled(boolean notificationEnabled) {
    this.notificationEnabled = notificationEnabled;
  }

  public String getNotificationCustomerName() {
    return notificationCustomerName;
  }

  public void setNotificationCustomerName(String notificationCustomerName) {
    this.notificationCustomerName = notificationCustomerName;
  }

  public String getNotificationPhoneHash() {
    return notificationPhoneHash;
  }

  public void setNotificationPhoneHash(String notificationPhoneHash) {
    this.notificationPhoneHash = notificationPhoneHash;
  }

  public String getNotificationPhoneMasked() {
    return notificationPhoneMasked;
  }

  public void setNotificationPhoneMasked(String notificationPhoneMasked) {
    this.notificationPhoneMasked = notificationPhoneMasked;
  }

  public String getNotificationPhoneEncrypted() {
    return notificationPhoneEncrypted;
  }

  public void setNotificationPhoneEncrypted(String notificationPhoneEncrypted) {
    this.notificationPhoneEncrypted = notificationPhoneEncrypted;
  }
}
