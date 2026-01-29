package com.nimbus.order.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class CatalogClient {
  private final RestTemplate restTemplate;
  private final String baseUrl;

  public CatalogClient(RestTemplate restTemplate, @Value("${catalog.base-url}") String baseUrl) {
    this.restTemplate = restTemplate;
    this.baseUrl = baseUrl;
  }

  public void adjustStock(String productId, int delta, String reason, String authHeader) {
    HttpHeaders headers = new HttpHeaders();
    if (authHeader != null && !authHeader.isBlank()) {
      headers.set(HttpHeaders.AUTHORIZATION, authHeader);
    }
    AdjustStockRequest body = new AdjustStockRequest(delta, reason);
    HttpEntity<AdjustStockRequest> entity = new HttpEntity<>(body, headers);
    String url = String.format("%s/api/products/%s/adjust-stock", baseUrl, productId);
    restTemplate.exchange(url, HttpMethod.POST, entity, Void.class);
  }

  public record AdjustStockRequest(int delta, String reason) {}
}
