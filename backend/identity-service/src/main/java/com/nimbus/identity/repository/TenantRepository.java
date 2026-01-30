package com.nimbus.identity.repository;

import com.nimbus.identity.model.Tenant;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, String> {

    void save(Tenant tenant);

    Optional<Tenant> findById(String tenantId);
}
