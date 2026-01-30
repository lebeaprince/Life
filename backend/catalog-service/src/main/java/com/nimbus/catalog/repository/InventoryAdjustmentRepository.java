package com.nimbus.catalog.repository;

import com.nimbus.catalog.model.InventoryAdjustment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryAdjustmentRepository extends JpaRepository<InventoryAdjustment, String> {
  List<InventoryAdjustment> findByTenantIdOrderByCreatedAtDesc(String tenantId);
}
