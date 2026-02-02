package com.nimbus.order.repository;

import com.nimbus.order.model.Order;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, String> {
  List<Order> findByTenantIdOrderByCreatedAtDesc(String tenantId);

  Optional<Order> findByIdAndTenantId(String id, String tenantId);

  boolean existsByTenantIdAndNotificationPhoneHashAndStatusIn(
      String tenantId,
      String notificationPhoneHash,
      List<String> status
  );
}
