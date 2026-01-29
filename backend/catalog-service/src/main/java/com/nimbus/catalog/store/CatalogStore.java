package com.nimbus.catalog.store;

import com.nimbus.catalog.model.InventoryAdjustment;
import com.nimbus.catalog.model.Product;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Component;

@Component
public class CatalogStore {
  private final Map<String, Product> products = new ConcurrentHashMap<>();
  private final List<InventoryAdjustment> adjustments = new CopyOnWriteArrayList<>();

  public List<Product> listProducts(String tenantId) {
    List<Product> result = new ArrayList<>();
    for (Product product : products.values()) {
      if (tenantId.equals(product.getTenantId())) {
        result.add(product);
      }
    }
    result.sort(Comparator.comparing(Product::getName, String.CASE_INSENSITIVE_ORDER));
    return result;
  }

  public Product createProduct(
      String tenantId,
      String name,
      String sku,
      double price,
      double cost,
      int stock,
      double taxRate
  ) {
    String productId = UUID.randomUUID().toString();
    Product product = new Product(productId, tenantId);
    product.setName(name);
    product.setSku(sku);
    product.setPrice(price);
    product.setCost(cost);
    product.setStock(stock);
    product.setTaxRate(taxRate);
    product.setActive(true);
    product.setCreatedAt(Instant.now());
    product.setUpdatedAt(product.getCreatedAt());
    products.put(productId, product);
    return product;
  }

  public Product updateProduct(
      String tenantId,
      String productId,
      String name,
      String sku,
      Double price,
      Double cost,
      Integer stock,
      Double taxRate,
      Boolean active
  ) {
    Product product = requireProduct(tenantId, productId);
    if (name != null) {
      product.setName(name);
    }
    if (sku != null) {
      product.setSku(sku);
    }
    if (price != null) {
      product.setPrice(price);
    }
    if (cost != null) {
      product.setCost(cost);
    }
    if (stock != null) {
      product.setStock(stock);
    }
    if (taxRate != null) {
      product.setTaxRate(taxRate);
    }
    if (active != null) {
      product.setActive(active);
    }
    product.setUpdatedAt(Instant.now());
    return product;
  }

  public InventoryAdjustment adjustStock(
      String tenantId,
      String userId,
      String productId,
      int delta,
      String reason
  ) {
    Product product = requireProduct(tenantId, productId);
    product.setStock(product.getStock() + delta);
    product.setUpdatedAt(Instant.now());

    InventoryAdjustment adjustment = new InventoryAdjustment(UUID.randomUUID().toString(), tenantId, productId);
    adjustment.setDelta(delta);
    adjustment.setReason(reason);
    adjustment.setCreatedBy(userId);
    adjustment.setCreatedAt(Instant.now());
    adjustments.add(adjustment);
    return adjustment;
  }

  public List<InventoryAdjustment> listAdjustments(String tenantId) {
    List<InventoryAdjustment> result = new ArrayList<>();
    for (InventoryAdjustment adjustment : adjustments) {
      if (tenantId.equals(adjustment.getTenantId())) {
        result.add(adjustment);
      }
    }
    result.sort(Comparator.comparing(InventoryAdjustment::getCreatedAt).reversed());
    return result;
  }

  private Product requireProduct(String tenantId, String productId) {
    Product product = products.get(productId);
    if (product == null || !tenantId.equals(product.getTenantId())) {
      throw new IllegalArgumentException("Product not found");
    }
    return product;
  }
}
