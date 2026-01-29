package com.nimbus.order.store;

import com.nimbus.order.model.Order;
import com.nimbus.order.model.OrderItem;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class OrderStore {
  private final Map<String, Order> orders = new ConcurrentHashMap<>();

  public List<Order> listOrders(String tenantId) {
    List<Order> result = new ArrayList<>();
    for (Order order : orders.values()) {
      if (tenantId.equals(order.getTenantId())) {
        result.add(order);
      }
    }
    result.sort(Comparator.comparing(Order::getCreatedAt).reversed());
    return result;
  }

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
    orders.put(orderId, order);
    return order;
  }
}
