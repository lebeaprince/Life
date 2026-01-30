package com.nimbus.catalog.store;

import com.nimbus.catalog.model.InventoryAdjustment;
import com.nimbus.catalog.model.Product;
import com.nimbus.catalog.repository.InventoryAdjustmentRepository;
import com.nimbus.catalog.repository.ProductRepository;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class CatalogStore {
  private final ProductRepository productRepository;
  private final InventoryAdjustmentRepository adjustmentRepository;

  public CatalogStore(
      ProductRepository productRepository,
      InventoryAdjustmentRepository adjustmentRepository
  ) {
    this.productRepository = productRepository;
    this.adjustmentRepository = adjustmentRepository;
  }

  public List<Product> listProducts(String tenantId) {
    List<Product> products = productRepository.findByTenantId(tenantId);
    products.sort(Comparator.comparing(Product::getName, String.CASE_INSENSITIVE_ORDER));
    return products;
  }

  @Transactional
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
    return productRepository.save(product);
  }

  @Transactional
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
    return productRepository.save(product);
  }

  @Transactional
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
    productRepository.save(product);

    InventoryAdjustment adjustment = new InventoryAdjustment(UUID.randomUUID().toString(), tenantId, productId);
    adjustment.setDelta(delta);
    adjustment.setReason(reason);
    adjustment.setCreatedBy(userId);
    adjustment.setCreatedAt(Instant.now());
    return adjustmentRepository.save(adjustment);
  }

  public List<InventoryAdjustment> listAdjustments(String tenantId) {
    return adjustmentRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
  }

  private Product requireProduct(String tenantId, String productId) {
    return productRepository.findByIdAndTenantId(productId, tenantId)
        .orElseThrow(() -> new IllegalArgumentException("Product not found"));
  }
}
