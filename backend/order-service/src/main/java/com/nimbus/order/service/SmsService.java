package com.nimbus.order.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class SmsService {
  private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

  public void sendReadyForCollection(
      String phoneNumber,
      String phoneMasked,
      String customerName,
      String orderId
  ) {
    String safeName = customerName == null || customerName.isBlank() ? "customer" : customerName;
    String target = phoneMasked == null || phoneMasked.isBlank() ? phoneNumber : phoneMasked;
    logger.info(
        "SMS ready notification queued for order {} to {}: Hi {}, your order is ready for collection.",
        orderId,
        target,
        safeName
    );
  }
}
