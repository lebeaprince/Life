package com.nimbus.order.controller;

import com.nimbus.order.client.CatalogClient;
import com.nimbus.order.client.SettingsClient;
import com.nimbus.order.config.RequestContext;
import com.nimbus.order.loyalty.LoyaltyProgramSettings;
import com.nimbus.order.model.Order;
import com.nimbus.order.model.OrderItem;
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
import org.springframework.util.StringUtils;
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
  private final SettingsClient settingsClient;

  public OrderController(
      OrderStore orderStore,
      CatalogClient catalogClient,
      SettingsClient settingsClient
  ) {
    this.orderStore = orderStore;
    this.catalogClient = catalogClient;
    this.settingsClient = settingsClient;
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

    try {
      for (OrderItem item : items) {
        catalogClient.adjustStock(item.getProductId(), -item.getQuantity(), "order", authHeader);
      }
    } catch (Exception ex) {
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to adjust inventory", ex);
    }

    boolean notifyWhenReady = Boolean.TRUE.equals(request.notifyWhenReady());
    boolean redeemReward = Boolean.TRUE.equals(request.redeemReward());
    if (notifyWhenReady) {
      if (!StringUtils.hasText(request.customerName())
          || !StringUtils.hasText(request.customerPhone())) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Customer name and phone are required for ready notifications"
        );
      }
    }
    if (redeemReward && !notifyWhenReady) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Redeem requires ready notification opt-in"
      );
    }

    LoyaltyProgramSettings loyaltySettings = settingsClient.getLoyaltySettings(authHeader);
    if (redeemReward && !loyaltySettings.loyaltyEnabled()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Loyalty program is disabled"
      );
    }

    try {
      Order order = orderStore.createOrder(
          tenantId,
          userId,
          items,
          request.subtotal(),
          request.tax(),
          request.total(),
          paymentType,
          notifyWhenReady,
          request.customerName(),
          request.customerPhone(),
          redeemReward,
          loyaltySettings
      );
      return toResponse(order);
    } catch (IllegalArgumentException ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
    }
  }

  @PostMapping("/{orderId}/ready")
  public OrderResponse markReady(
      @PathVariable("orderId") String orderId,
      HttpServletRequest httpRequest
  ) {
    String tenantId = RequestContext.require().tenantId();
    String userId = RequestContext.require().userId();
    String authHeader = httpRequest.getHeader(HttpHeaders.AUTHORIZATION);
    LoyaltyProgramSettings loyaltySettings = settingsClient.getLoyaltySettings(authHeader);
    try {
      Order order = orderStore.markReady(tenantId, orderId, userId, loyaltySettings);
      return toResponse(order);
    } catch (IllegalArgumentException ex) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage(), ex);
    }
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
    return new OrderResponse(
        order.getId(),
        createdAt,
        order.getCreatedBy(),
        order.getStatus(),
        items,
        order.getSubtotal(),
        order.getTax(),
        order.getTotal(),
        order.getPaymentType()
    );
  }

  public record OrderRequest(
      @jakarta.validation.constraints.NotNull List<@Valid OrderItemRequest> items,
      double subtotal,
      double tax,
      double total,
      String paymentType,
      Boolean notifyWhenReady,
      String customerName,
      String customerPhone,
      Boolean redeemReward
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
      String paymentType
  ) {}

  public record OrderItemResponse(
      String productId,
      String name,
      double price,
      double taxRate,
      int quantity
  ) {}
}
