package com.nimbus.order.store;

import com.nimbus.order.model.Order;
import com.nimbus.order.model.OrderItem;
import com.nimbus.order.repository.OrderRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class OrderStore {
  private final OrderRepository orderRepository;

  public OrderStore(OrderRepository orderRepository) {
    this.orderRepository = orderRepository;
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
      String paymentType
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
    return orderRepository.save(order);
  }
}
