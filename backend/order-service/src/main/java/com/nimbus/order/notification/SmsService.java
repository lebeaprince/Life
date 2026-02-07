package com.nimbus.order.notification;

public interface SmsService {
  void sendOrderReady(String phoneNumber, String orderId, String customerName);
}
