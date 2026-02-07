package com.nimbus.settings.store;

import com.nimbus.settings.model.TenantSettings;
import com.nimbus.settings.repository.TenantSettingsRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SettingsStore {
  private static final String DEFAULT_CURRENCY = "USD";
  private static final double DEFAULT_TAX_RATE = 0.08;
  private static final int DEFAULT_LOW_STOCK = 5;
  private static final boolean DEFAULT_LOYALTY_ENABLED = true;
  private static final int DEFAULT_LOYALTY_POINTS_PER_ORDER = 10;
  private static final int DEFAULT_LOYALTY_REWARD_THRESHOLD = 100;
  private static final boolean DEFAULT_READY_NOTIFICATIONS_ENABLED = true;

  private final TenantSettingsRepository settingsRepository;

  public SettingsStore(TenantSettingsRepository settingsRepository) {
    this.settingsRepository = settingsRepository;
  }

  @Transactional
  public TenantSettings getOrCreate(String tenantId) {
    return settingsRepository.findById(tenantId)
        .orElseGet(() -> settingsRepository.save(createDefaultSettings(tenantId)));
  }

  @Transactional
  public TenantSettings update(
      String tenantId,
      String currency,
      Double taxRate,
      Integer lowStockThreshold,
      Boolean loyaltyEnabled,
      Integer loyaltyPointsPerOrder,
      Integer loyaltyRewardThreshold,
      Boolean orderReadyNotificationsEnabled
  ) {
    TenantSettings settings = settingsRepository.findById(tenantId)
        .orElseGet(() -> createDefaultSettings(tenantId));
    if (currency != null) {
      settings.setCurrency(currency);
    }
    if (taxRate != null) {
      settings.setTaxRate(taxRate);
    }
    if (lowStockThreshold != null) {
      settings.setLowStockThreshold(lowStockThreshold);
    }
    if (loyaltyEnabled != null) {
      settings.setLoyaltyEnabled(loyaltyEnabled);
    }
    if (loyaltyPointsPerOrder != null) {
      settings.setLoyaltyPointsPerOrder(loyaltyPointsPerOrder);
    }
    if (loyaltyRewardThreshold != null) {
      settings.setLoyaltyRewardThreshold(loyaltyRewardThreshold);
    }
    if (orderReadyNotificationsEnabled != null) {
      settings.setOrderReadyNotificationsEnabled(orderReadyNotificationsEnabled);
    }
    return settingsRepository.save(settings);
  }

  private TenantSettings createDefaultSettings(String tenantId) {
    TenantSettings settings = new TenantSettings(tenantId);
    settings.setCurrency(DEFAULT_CURRENCY);
    settings.setTaxRate(DEFAULT_TAX_RATE);
    settings.setLowStockThreshold(DEFAULT_LOW_STOCK);
    settings.setLoyaltyEnabled(DEFAULT_LOYALTY_ENABLED);
    settings.setLoyaltyPointsPerOrder(DEFAULT_LOYALTY_POINTS_PER_ORDER);
    settings.setLoyaltyRewardThreshold(DEFAULT_LOYALTY_REWARD_THRESHOLD);
    settings.setOrderReadyNotificationsEnabled(DEFAULT_READY_NOTIFICATIONS_ENABLED);
    return settings;
  }
}
