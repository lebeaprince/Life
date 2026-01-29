package com.nimbus.settings.controller;

import com.nimbus.settings.config.RequestContext;
import com.nimbus.settings.model.TenantSettings;
import com.nimbus.settings.store.SettingsStore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
  private final SettingsStore settingsStore;

  public SettingsController(SettingsStore settingsStore) {
    this.settingsStore = settingsStore;
  }

  @GetMapping
  public SettingsResponse getSettings() {
    String tenantId = RequestContext.require().tenantId();
    return toResponse(settingsStore.getOrCreate(tenantId));
  }

  @PutMapping
  public SettingsResponse updateSettings(@Valid @RequestBody SettingsRequest request) {
    String tenantId = RequestContext.require().tenantId();
    TenantSettings updated = settingsStore.update(
        tenantId,
        request.currency(),
        request.taxRate(),
        request.lowStockThreshold()
    );
    return toResponse(updated);
  }

  private SettingsResponse toResponse(TenantSettings settings) {
    return new SettingsResponse(
        settings.getCurrency(),
        settings.getTaxRate(),
        settings.getLowStockThreshold()
    );
  }

  public record SettingsRequest(
      String currency,
      Double taxRate,
      @Min(0) Integer lowStockThreshold
  ) {}

  public record SettingsResponse(
      String currency,
      double taxRate,
      int lowStockThreshold
  ) {}
}
