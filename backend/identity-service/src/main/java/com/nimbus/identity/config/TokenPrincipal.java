package com.nimbus.identity.config;

import java.util.List;

public record TokenPrincipal(
    String userId,
    String tenantId,
    String email,
    String displayName,
    List<String> roles
) {}
