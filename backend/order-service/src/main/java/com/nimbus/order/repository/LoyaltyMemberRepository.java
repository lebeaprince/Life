package com.nimbus.order.repository;

import com.nimbus.order.model.LoyaltyMember;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoyaltyMemberRepository extends JpaRepository<LoyaltyMember, String> {
  Optional<LoyaltyMember> findByTenantIdAndPhoneHash(String tenantId, String phoneHash);
}
