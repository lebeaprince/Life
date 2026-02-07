package com.nimbus.order.loyalty;

public record LoyaltyProgramSettings(
    boolean loyaltyEnabled,
    int loyaltyPointsPerOrder,
    int loyaltyRewardThreshold,
    boolean orderReadyNotificationsEnabled
) {}
