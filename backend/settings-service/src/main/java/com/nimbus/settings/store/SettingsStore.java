package com.nimbus.settings.store;

import com.nimbus.settings.model.TenantSettings;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class SettingsStore {
  private static final String DEFAULT_CURRENCY = "USD";
  private static final double DEFAULT_TAX_RATE = 0.08;
  private static final int DEFAULT_LOW_STOCK = 5;

  private final Map<String, TenantSettings> settingsByTenant = new ConcurrentHashMap<>();

  public TenantSettings getOrCreate(String tenantId) {
    return settingsByTenant.computeIfAbsent(tenantId, this::createDefaultSettings);
  }

  public TenantSettings update(String tenantId, String currency, Double taxRate, Integer lowStockThreshold) {
    TenantSettings settings = getOrCreate(tenantId);
    if (currency != null) {
      settings.setCurrency(currency);
    }
    if (taxRate != null) {
      settings.setTaxRate(taxRate);
    }
    if (lowStockThreshold != null) {
      settings.setLowStockThreshold(lowStockThreshold);
    }
    return settings;
  }

  private TenantSettings createDefaultSettings(String tenantId) {
    TenantSettings settings = new TenantSettings(tenantId);
    settings.setCurrency(DEFAULT_CURRENCY);
    settings.setTaxRate(DEFAULT_TAX_RATE);
    settings.setLowStockThreshold(DEFAULT_LOW_STOCK);
    return settings;
  }
}
