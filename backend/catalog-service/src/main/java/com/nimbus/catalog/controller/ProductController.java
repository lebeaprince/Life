package com.nimbus.catalog.controller;

import com.nimbus.catalog.config.RequestContext;
import com.nimbus.catalog.model.InventoryAdjustment;
import com.nimbus.catalog.model.Product;
import com.nimbus.catalog.store.CatalogStore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ProductController {
  private static final DateTimeFormatter ISO_FORMATTER =
      DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC);

  private final CatalogStore catalogStore;

  public ProductController(CatalogStore catalogStore) {
    this.catalogStore = catalogStore;
  }

  @GetMapping("/products")
  public List<ProductResponse> listProducts() {
    String tenantId = RequestContext.require().tenantId();
    return catalogStore.listProducts(tenantId).stream()
        .map(this::toProductResponse)
        .collect(Collectors.toList());
  }

  @PostMapping("/products")
  @ResponseStatus(HttpStatus.CREATED)
  public ProductResponse createProduct(@Valid @RequestBody ProductCreateRequest request) {
    String tenantId = RequestContext.require().tenantId();
    Product product = catalogStore.createProduct(
        tenantId,
        request.name(),
        request.sku(),
        request.price(),
        request.cost(),
        request.stock(),
        request.taxRate()
    );
    return toProductResponse(product);
  }

  @PatchMapping("/products/{productId}")
  public ProductResponse updateProduct(
      @PathVariable String productId,
      @RequestBody ProductUpdateRequest request
  ) {
    String tenantId = RequestContext.require().tenantId();
    try {
      Product product = catalogStore.updateProduct(
          tenantId,
          productId,
          request.name(),
          request.sku(),
          request.price(),
          request.cost(),
          request.stock(),
          request.taxRate(),
          request.active()
      );
      return toProductResponse(product);
    } catch (IllegalArgumentException ex) {
      throw new org.springframework.web.server.ResponseStatusException(
          org.springframework.http.HttpStatus.NOT_FOUND,
          ex.getMessage(),
          ex
      );
    }
  }

  @PostMapping("/products/{productId}/adjust-stock")
  @ResponseStatus(HttpStatus.CREATED)
  public InventoryAdjustmentResponse adjustStock(
      @PathVariable String productId,
      @Valid @RequestBody AdjustStockRequest request
  ) {
    String tenantId = RequestContext.require().tenantId();
    String userId = RequestContext.require().userId();
    try {
      InventoryAdjustment adjustment = catalogStore.adjustStock(
          tenantId,
          userId,
          productId,
          request.delta(),
          request.reason()
      );
      return toAdjustmentResponse(adjustment);
    } catch (IllegalArgumentException ex) {
      throw new org.springframework.web.server.ResponseStatusException(
          org.springframework.http.HttpStatus.NOT_FOUND,
          ex.getMessage(),
          ex
      );
    }
  }

  @GetMapping("/inventory/adjustments")
  public List<InventoryAdjustmentResponse> listAdjustments() {
    String tenantId = RequestContext.require().tenantId();
    return catalogStore.listAdjustments(tenantId).stream()
        .map(this::toAdjustmentResponse)
        .collect(Collectors.toList());
  }

  private ProductResponse toProductResponse(Product product) {
    String createdAt = product.getCreatedAt() == null ? null : ISO_FORMATTER.format(product.getCreatedAt());
    String updatedAt = product.getUpdatedAt() == null ? null : ISO_FORMATTER.format(product.getUpdatedAt());
    return new ProductResponse(
        product.getId(),
        product.getName(),
        product.getSku(),
        product.getPrice(),
        product.getCost(),
        product.getStock(),
        product.getTaxRate(),
        product.isActive(),
        createdAt,
        updatedAt
    );
  }

  private InventoryAdjustmentResponse toAdjustmentResponse(InventoryAdjustment adjustment) {
    String createdAt = adjustment.getCreatedAt() == null
        ? null
        : ISO_FORMATTER.format(adjustment.getCreatedAt());
    return new InventoryAdjustmentResponse(
        adjustment.getId(),
        adjustment.getProductId(),
        adjustment.getDelta(),
        adjustment.getReason(),
        adjustment.getCreatedBy(),
        createdAt
    );
  }

  public record ProductCreateRequest(
      @NotBlank String name,
      @NotBlank String sku,
      @NotNull double price,
      @NotNull double cost,
      @NotNull @Min(0) int stock,
      @NotNull double taxRate
  ) {}

  public record ProductUpdateRequest(
      String name,
      String sku,
      Double price,
      Double cost,
      Integer stock,
      Double taxRate,
      Boolean active
  ) {}

  public record AdjustStockRequest(
      int delta,
      @NotBlank String reason
  ) {}

  public record ProductResponse(
      String id,
      String name,
      String sku,
      double price,
      double cost,
      int stock,
      double taxRate,
      boolean active,
      String createdAt,
      String updatedAt
  ) {}

  public record InventoryAdjustmentResponse(
      String id,
      String productId,
      int delta,
      String reason,
      String createdBy,
      String createdAt
  ) {}
}
