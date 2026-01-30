package com.nimbus.settings.repository;

import com.nimbus.settings.model.TenantSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantSettingsRepository extends JpaRepository<TenantSettings, String> {}
