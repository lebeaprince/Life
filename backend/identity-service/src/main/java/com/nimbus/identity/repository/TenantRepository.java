package com.nimbus.identity.repository;

import com.nimbus.identity.model.Tenant;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, String> {

    <S extends Tenant> S save(S tenant);

    Optional<Tenant> findById(String tenantId);
}
