package com.nimbus.order.controller;

import com.nimbus.order.client.CatalogClient;
import com.nimbus.order.config.RequestContext;
import com.nimbus.order.model.Order;
import com.nimbus.order.model.OrderItem;
import com.nimbus.order.model.OrderNotificationDetails;
import com.nimbus.order.model.OrderStatus;
import com.nimbus.order.service.PhoneProtectionService;
import com.nimbus.order.service.SmsService;
import com.nimbus.order.store.OrderStore;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
  private static final DateTimeFormatter ISO_FORMATTER =
      DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC);

  private final OrderStore orderStore;
  private final CatalogClient catalogClient;
  private final PhoneProtectionService phoneProtectionService;
  private final SmsService smsService;

  public OrderController(
      OrderStore orderStore,
      CatalogClient catalogClient,
      PhoneProtectionService phoneProtectionService,
      SmsService smsService
  ) {
    this.orderStore = orderStore;
    this.catalogClient = catalogClient;
    this.phoneProtectionService = phoneProtectionService;
    this.smsService = smsService;
  }

  @GetMapping
  public List<OrderResponse> listOrders() {
    String tenantId = RequestContext.require().tenantId();
    return orderStore.listOrders(tenantId).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public OrderResponse createOrder(
      @Valid @RequestBody OrderRequest request,
      HttpServletRequest httpRequest
  ) {
    String tenantId = RequestContext.require().tenantId();
    String userId = RequestContext.require().userId();
    String authHeader = httpRequest.getHeader(HttpHeaders.AUTHORIZATION);

    List<OrderItem> items = request.items().stream().map(this::toItem).collect(Collectors.toList());
    String paymentType = request.paymentType() == null ? "cash" : request.paymentType();
    OrderNotificationDetails notificationDetails = null;

    if (request.notification() != null) {
      String customerName = request.notification().customerName().trim();
      if (customerName.isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer name is required");
      }
      PhoneProtectionService.PhoneDetails phoneDetails;
      try {
        phoneDetails = phoneProtectionService.protect(request.notification().phoneNumber());
      } catch (IllegalArgumentException ex) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
      }
      if (orderStore.isPhoneInUse(tenantId, phoneDetails.hash())) {
        throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Cellphone number already exists for another active order"
        );
      }
      notificationDetails = new OrderNotificationDetails(
          customerName,
          phoneDetails.encrypted(),
          phoneDetails.hash(),
          phoneDetails.masked()
      );
    }

    try {
      for (OrderItem item : items) {
        catalogClient.adjustStock(item.getProductId(), -item.getQuantity(), "order", authHeader);
      }
    } catch (Exception ex) {
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to adjust inventory", ex);
    }

    Order order = orderStore.createOrder(
        tenantId,
        userId,
        items,
        request.subtotal(),
        request.tax(),
        request.total(),
        paymentType,
        notificationDetails
    );
    return toResponse(order);
  }

  @PostMapping("/{orderId}/ready")
  public OrderResponse markReady(@PathVariable String orderId) {
    String tenantId = RequestContext.require().tenantId();
    Order order = orderStore.findOrder(tenantId, orderId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

    if (OrderStatus.READY.equals(order.getStatus())) {
      return toResponse(order);
    }

    if (order.isNotificationEnabled()) {
      String phoneNumber;
      try {
        phoneNumber = phoneProtectionService.decrypt(order.getNotificationPhoneEncrypted());
      } catch (IllegalStateException ex) {
        throw new ResponseStatusException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Unable to read notification phone number",
            ex
        );
      }
      try {
        smsService.sendReadyForCollection(
            phoneNumber,
            order.getNotificationPhoneMasked(),
            order.getNotificationCustomerName(),
            order.getId()
        );
      } catch (Exception ex) {
        throw new ResponseStatusException(
            HttpStatus.BAD_GATEWAY,
            "Unable to send ready notification",
            ex
        );
      }
    }

    Order updated = orderStore.markOrderReady(order);
    return toResponse(updated);
  }

  private OrderItem toItem(OrderItemRequest request) {
    OrderItem item = new OrderItem();
    item.setProductId(request.productId());
    item.setName(request.name());
    item.setPrice(request.price());
    item.setTaxRate(request.taxRate());
    item.setQuantity(request.quantity());
    return item;
  }

  private OrderResponse toResponse(Order order) {
    String createdAt = order.getCreatedAt() == null ? null : ISO_FORMATTER.format(order.getCreatedAt());
    List<OrderItemResponse> items = order.getItems().stream()
        .map(item -> new OrderItemResponse(
            item.getProductId(),
            item.getName(),
            item.getPrice(),
            item.getTaxRate(),
            item.getQuantity()
        ))
        .collect(Collectors.toList());
    OrderNotificationResponse notification = null;
    if (order.isNotificationEnabled()) {
      notification = new OrderNotificationResponse(
          order.getNotificationCustomerName(),
          order.getNotificationPhoneMasked()
      );
    }
    return new OrderResponse(
        order.getId(),
        createdAt,
        order.getCreatedBy(),
        order.getStatus(),
        items,
        order.getSubtotal(),
        order.getTax(),
        order.getTotal(),
        order.getPaymentType(),
        notification
    );
  }

  public record OrderRequest(
      @jakarta.validation.constraints.NotNull List<@Valid OrderItemRequest> items,
      double subtotal,
      double tax,
      double total,
      String paymentType,
      @Valid OrderNotificationRequest notification
  ) {}

  public record OrderNotificationRequest(
      @NotBlank String customerName,
      @NotBlank String phoneNumber
  ) {}

  public record OrderItemRequest(
      @NotBlank String productId,
      @NotBlank String name,
      double price,
      double taxRate,
      @Min(1) int quantity
  ) {}

  public record OrderResponse(
      String id,
      String createdAt,
      String createdBy,
      String status,
      List<OrderItemResponse> items,
      double subtotal,
      double tax,
      double total,
      String paymentType,
      OrderNotificationResponse notification
  ) {}

  public record OrderNotificationResponse(
      String customerName,
      String phoneMasked
  ) {}

  public record OrderItemResponse(
      String productId,
      String name,
      double price,
      double taxRate,
      int quantity
  ) {}
}
