package com.nimbus.order.store;

import com.nimbus.order.model.Order;
import com.nimbus.order.model.OrderItem;
import com.nimbus.order.model.OrderNotificationDetails;
import com.nimbus.order.model.OrderStatus;
import com.nimbus.order.repository.OrderRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class OrderStore {
  private static final List<String> ACTIVE_NOTIFICATION_STATUSES =
      List.of(OrderStatus.PAID, OrderStatus.OPEN);

  private final OrderRepository orderRepository;

  public OrderStore(OrderRepository orderRepository) {
    this.orderRepository = orderRepository;
  }

  public List<Order> listOrders(String tenantId) {
    return orderRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
  }

  public Optional<Order> findOrder(String tenantId, String orderId) {
    return orderRepository.findByIdAndTenantId(orderId, tenantId);
  }

  public boolean isPhoneInUse(String tenantId, String phoneHash) {
    return orderRepository.existsByTenantIdAndNotificationPhoneHashAndStatusIn(
        tenantId,
        phoneHash,
        ACTIVE_NOTIFICATION_STATUSES
    );
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
      OrderNotificationDetails notificationDetails
  ) {
    String orderId = UUID.randomUUID().toString();
    Order order = new Order(orderId, tenantId);
    order.setItems(items);
    order.setSubtotal(subtotal);
    order.setTax(tax);
    order.setTotal(total);
    order.setPaymentType(paymentType);
    order.setCreatedBy(userId);
    order.setStatus(OrderStatus.PAID);
    order.setCreatedAt(Instant.now());
    if (notificationDetails != null) {
      order.setNotificationEnabled(true);
      order.setNotificationCustomerName(notificationDetails.customerName());
      order.setNotificationPhoneEncrypted(notificationDetails.phoneEncrypted());
      order.setNotificationPhoneHash(notificationDetails.phoneHash());
      order.setNotificationPhoneMasked(notificationDetails.phoneMasked());
    }
    return orderRepository.save(order);
  }

  @Transactional
  public Order markOrderReady(Order order) {
    order.setStatus(OrderStatus.READY);
    return orderRepository.save(order);
  }
}
