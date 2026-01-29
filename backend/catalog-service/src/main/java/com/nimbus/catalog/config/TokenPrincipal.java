package com.nimbus.catalog.config;

import java.util.List;

public record TokenPrincipal(
    String userId,
    String tenantId,
    String email,
    String displayName,
    List<String> roles
) {}
