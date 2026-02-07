package com.nimbus.settings.model;



import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "settings_tenant_settings")
public class TenantSettings {
  @Id
  @Column(name = "tenant_id", nullable = false, updatable = false)
  private String tenantId;

  private String currency;
  private double taxRate;
  private int lowStockThreshold;
  @Column(name = "loyalty_enabled")
  private boolean loyaltyEnabled;
  @Column(name = "loyalty_points_per_order")
  private int loyaltyPointsPerOrder;
  @Column(name = "loyalty_reward_threshold")
  private int loyaltyRewardThreshold;
  @Column(name = "order_ready_notifications_enabled")
  private boolean orderReadyNotificationsEnabled;

  protected TenantSettings() {}

  public TenantSettings(String tenantId) {
    this.tenantId = tenantId;
  }

  public String getTenantId() {
    return tenantId;
  }

  public String getCurrency() {
    return currency;
  }

  public void setCurrency(String currency) {
    this.currency = currency;
  }

  public double getTaxRate() {
    return taxRate;
  }

  public void setTaxRate(double taxRate) {
    this.taxRate = taxRate;
  }

  public int getLowStockThreshold() {
    return lowStockThreshold;
  }

  public void setLowStockThreshold(int lowStockThreshold) {
    this.lowStockThreshold = lowStockThreshold;
  }

  public boolean isLoyaltyEnabled() {
    return loyaltyEnabled;
  }

  public void setLoyaltyEnabled(boolean loyaltyEnabled) {
    this.loyaltyEnabled = loyaltyEnabled;
  }

  public int getLoyaltyPointsPerOrder() {
    return loyaltyPointsPerOrder;
  }

  public void setLoyaltyPointsPerOrder(int loyaltyPointsPerOrder) {
    this.loyaltyPointsPerOrder = loyaltyPointsPerOrder;
  }

  public int getLoyaltyRewardThreshold() {
    return loyaltyRewardThreshold;
  }

  public void setLoyaltyRewardThreshold(int loyaltyRewardThreshold) {
    this.loyaltyRewardThreshold = loyaltyRewardThreshold;
  }

  public boolean isOrderReadyNotificationsEnabled() {
    return orderReadyNotificationsEnabled;
  }

  public void setOrderReadyNotificationsEnabled(boolean orderReadyNotificationsEnabled) {
    this.orderReadyNotificationsEnabled = orderReadyNotificationsEnabled;
  }
}
