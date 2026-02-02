package com.nimbus.order.model;

public record OrderNotificationDetails(
    String customerName,
    String phoneEncrypted,
    String phoneHash,
    String phoneMasked
) {}
