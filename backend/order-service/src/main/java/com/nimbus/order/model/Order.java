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
  @Column(name = "notify_when_ready")
  private boolean notifyWhenReady;
  @Column(name = "customer_name_encrypted", length = 512)
  private String customerNameEncrypted;
  @Column(name = "customer_phone_encrypted", length = 512)
  private String customerPhoneEncrypted;
  @Column(name = "customer_phone_hash")
  private String customerPhoneHash;
  @Column(name = "loyalty_member_id")
  private String loyaltyMemberId;
  @Column(name = "loyalty_points_awarded")
  private int loyaltyPointsAwarded;
  @Column(name = "loyalty_points_redeemed")
  private int loyaltyPointsRedeemed;
  @Column(name = "loyalty_reward_redeemed")
  private boolean loyaltyRewardRedeemed;
  @Column(name = "ready_at")
  private Instant readyAt;
  @Column(name = "ready_by")
  private String readyBy;

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

  public boolean isNotifyWhenReady() {
    return notifyWhenReady;
  }

  public void setNotifyWhenReady(boolean notifyWhenReady) {
    this.notifyWhenReady = notifyWhenReady;
  }

  public String getCustomerNameEncrypted() {
    return customerNameEncrypted;
  }

  public void setCustomerNameEncrypted(String customerNameEncrypted) {
    this.customerNameEncrypted = customerNameEncrypted;
  }

  public String getCustomerPhoneEncrypted() {
    return customerPhoneEncrypted;
  }

  public void setCustomerPhoneEncrypted(String customerPhoneEncrypted) {
    this.customerPhoneEncrypted = customerPhoneEncrypted;
  }

  public String getCustomerPhoneHash() {
    return customerPhoneHash;
  }

  public void setCustomerPhoneHash(String customerPhoneHash) {
    this.customerPhoneHash = customerPhoneHash;
  }

  public String getLoyaltyMemberId() {
    return loyaltyMemberId;
  }

  public void setLoyaltyMemberId(String loyaltyMemberId) {
    this.loyaltyMemberId = loyaltyMemberId;
  }

  public int getLoyaltyPointsAwarded() {
    return loyaltyPointsAwarded;
  }

  public void setLoyaltyPointsAwarded(int loyaltyPointsAwarded) {
    this.loyaltyPointsAwarded = loyaltyPointsAwarded;
  }

  public int getLoyaltyPointsRedeemed() {
    return loyaltyPointsRedeemed;
  }

  public void setLoyaltyPointsRedeemed(int loyaltyPointsRedeemed) {
    this.loyaltyPointsRedeemed = loyaltyPointsRedeemed;
  }

  public boolean isLoyaltyRewardRedeemed() {
    return loyaltyRewardRedeemed;
  }

  public void setLoyaltyRewardRedeemed(boolean loyaltyRewardRedeemed) {
    this.loyaltyRewardRedeemed = loyaltyRewardRedeemed;
  }

  public Instant getReadyAt() {
    return readyAt;
  }

  public void setReadyAt(Instant readyAt) {
    this.readyAt = readyAt;
  }

  public String getReadyBy() {
    return readyBy;
  }

  public void setReadyBy(String readyBy) {
    this.readyBy = readyBy;
  }
}
