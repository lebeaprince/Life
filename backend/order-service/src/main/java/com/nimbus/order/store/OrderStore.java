package com.nimbus.order.store;

import com.nimbus.order.loyalty.LoyaltyProgramSettings;
import com.nimbus.order.loyalty.LoyaltyService;
import com.nimbus.order.model.Order;
import com.nimbus.order.model.OrderItem;
import com.nimbus.order.notification.SmsService;
import com.nimbus.order.repository.OrderRepository;
import com.nimbus.order.security.PiiCryptoService;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class OrderStore {
  private final OrderRepository orderRepository;
  private final LoyaltyService loyaltyService;
  private final PiiCryptoService piiCryptoService;
  private final SmsService smsService;

  public OrderStore(
      OrderRepository orderRepository,
      LoyaltyService loyaltyService,
      PiiCryptoService piiCryptoService,
      SmsService smsService
  ) {
    this.orderRepository = orderRepository;
    this.loyaltyService = loyaltyService;
    this.piiCryptoService = piiCryptoService;
    this.smsService = smsService;
  }

  public List<Order> listOrders(String tenantId) {
    return orderRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
  }

  @Transactional
  public Order createOrder(
      String tenantId,
      String userId,
      List<OrderItem> items,
      double subtotal,
      double tax,
      double total,
      String paymentType,
      boolean notifyWhenReady,
      String customerName,
      String customerPhone,
      boolean redeemReward,
      LoyaltyProgramSettings loyaltySettings
  ) {
    String orderId = UUID.randomUUID().toString();
    Order order = new Order(orderId, tenantId);
    order.setItems(items);
    order.setSubtotal(subtotal);
    order.setTax(tax);
    order.setTotal(total);
    order.setPaymentType(paymentType);
    order.setCreatedBy(userId);
    order.setStatus("paid");
    order.setCreatedAt(Instant.now());
    order.setNotifyWhenReady(notifyWhenReady);

    String normalizedPhone = null;
    if (notifyWhenReady) {
      normalizedPhone = piiCryptoService.normalizePhone(customerPhone);
      if (normalizedPhone.isBlank()) {
        throw new IllegalArgumentException("Customer phone is required for ready notifications");
      }
      order.setCustomerNameEncrypted(piiCryptoService.encrypt(safeTrim(customerName)));
      order.setCustomerPhoneEncrypted(piiCryptoService.encrypt(normalizedPhone));
      order.setCustomerPhoneHash(piiCryptoService.hashPhone(normalizedPhone));
    }

    if (notifyWhenReady && loyaltySettings.loyaltyEnabled()) {
      LoyaltyService.LoyaltyOutcome outcome = loyaltyService.registerPurchase(
          tenantId,
          customerName,
          customerPhone,
          loyaltySettings,
          redeemReward
      );
      order.setLoyaltyMemberId(outcome.member().getId());
      order.setLoyaltyPointsAwarded(outcome.pointsAwarded());
      order.setLoyaltyPointsRedeemed(outcome.pointsRedeemed());
      order.setLoyaltyRewardRedeemed(outcome.rewardRedeemed());
      if (outcome.rewardRedeemed()) {
        order.setTotal(0);
      }
    }
    return orderRepository.save(order);
  }

  @Transactional
  public Order markReady(
      String tenantId,
      String orderId,
      String readyByUserId,
      LoyaltyProgramSettings settings
  ) {
    Order order = orderRepository.findById(orderId)
        .orElseThrow(() -> new IllegalArgumentException("Order not found"));
    if (!order.getTenantId().equals(tenantId)) {
      throw new IllegalArgumentException("Order not found");
    }
    boolean alreadyReady = "ready".equalsIgnoreCase(order.getStatus());
    if (!alreadyReady) {
      order.setStatus("ready");
      order.setReadyBy(readyByUserId);
      order.setReadyAt(Instant.now());
      orderRepository.save(order);
    }

    if (!alreadyReady && order.isNotifyWhenReady() && settings.orderReadyNotificationsEnabled()) {
      String phone = piiCryptoService.decrypt(order.getCustomerPhoneEncrypted());
      String name = piiCryptoService.decrypt(order.getCustomerNameEncrypted());
      if (phone != null && !phone.isBlank()) {
        smsService.sendOrderReady(phone, order.getId(), name);
      }
    }
    return order;
  }

  private String safeTrim(String value) {
    return value == null ? "" : value.trim();
  }
}
