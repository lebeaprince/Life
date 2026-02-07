package com.nimbus.order.client;

import com.nimbus.order.loyalty.LoyaltyProgramSettings;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class SettingsClient {
  private final RestTemplate restTemplate;
  private final String baseUrl;

  public SettingsClient(RestTemplate restTemplate, @Value("${settings.base-url}") String baseUrl) {
    this.restTemplate = restTemplate;
    this.baseUrl = baseUrl;
  }

  public LoyaltyProgramSettings getLoyaltySettings(String authHeader) {
    HttpHeaders headers = new HttpHeaders();
    if (authHeader != null && !authHeader.isBlank()) {
      headers.set(HttpHeaders.AUTHORIZATION, authHeader);
    }
    HttpEntity<Void> entity = new HttpEntity<>(headers);
    String url = String.format("%s/api/settings", baseUrl);
    SettingsResponse response = restTemplate.exchange(url, HttpMethod.GET, entity, SettingsResponse.class)
        .getBody();
    if (response == null) {
      return new LoyaltyProgramSettings(false, 0, 0, false);
    }
    return new LoyaltyProgramSettings(
        response.loyaltyEnabled(),
        response.loyaltyPointsPerOrder(),
        response.loyaltyRewardThreshold(),
        response.orderReadyNotificationsEnabled()
    );
  }

  public record SettingsResponse(
      String currency,
      double taxRate,
      int lowStockThreshold,
      boolean loyaltyEnabled,
      int loyaltyPointsPerOrder,
      int loyaltyRewardThreshold,
      boolean orderReadyNotificationsEnabled
  ) {}
}
