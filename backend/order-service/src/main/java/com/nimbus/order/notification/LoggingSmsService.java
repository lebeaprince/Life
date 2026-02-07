package com.nimbus.order.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class LoggingSmsService implements SmsService {
  private static final Logger LOGGER = LoggerFactory.getLogger(LoggingSmsService.class);

  @Override
  public void sendOrderReady(String phoneNumber, String orderId, String customerName) {
    String masked = maskPhone(phoneNumber);
    String name = customerName == null || customerName.isBlank() ? "Customer" : customerName.trim();
    LOGGER.info("SMS ready notification queued for {} ({}) order {}", name, masked, orderId);
  }

  private String maskPhone(String phoneNumber) {
    if (phoneNumber == null || phoneNumber.isBlank()) {
      return "***";
    }
    String trimmed = phoneNumber.trim();
    int length = trimmed.length();
    if (length <= 4) {
      return "***" + trimmed;
    }
    return "***" + trimmed.substring(length - 4);
  }
}
