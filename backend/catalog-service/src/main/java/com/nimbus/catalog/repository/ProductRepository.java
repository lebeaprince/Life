package com.nimbus.catalog.repository;

import com.nimbus.catalog.model.Product;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, String> {
  List<Product> findByTenantId(String tenantId);

  Optional<Product> findByIdAndTenantId(String id, String tenantId);
}
