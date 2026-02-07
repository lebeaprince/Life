package com.nimbus.order.controller;

import com.nimbus.order.client.SettingsClient;
import com.nimbus.order.config.RequestContext;
import com.nimbus.order.loyalty.LoyaltyProgramSettings;
import com.nimbus.order.loyalty.LoyaltyService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/loyalty")
public class LoyaltyController {
  private final LoyaltyService loyaltyService;
  private final SettingsClient settingsClient;

  public LoyaltyController(LoyaltyService loyaltyService, SettingsClient settingsClient) {
    this.loyaltyService = loyaltyService;
    this.settingsClient = settingsClient;
  }

  @GetMapping("/members/lookup")
  public LoyaltyLookupResponse lookup(
      @RequestParam("phone") String phone,
      HttpServletRequest httpRequest
  ) {
    if (!StringUtils.hasText(phone)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number is required");
    }
    String tenantId = RequestContext.require().tenantId();
    String authHeader = httpRequest.getHeader(HttpHeaders.AUTHORIZATION);
    LoyaltyProgramSettings settings = settingsClient.getLoyaltySettings(authHeader);

    if (!settings.loyaltyEnabled()) {
      return new LoyaltyLookupResponse(
          false,
          settings.orderReadyNotificationsEnabled(),
          0,
          settings.loyaltyRewardThreshold(),
          false,
          settings.loyaltyRewardThreshold(),
          null
      );
    }

    return loyaltyService.lookupMember(tenantId, phone)
        .map(member -> {
          int threshold = settings.loyaltyRewardThreshold();
          boolean rewardAvailable = threshold > 0 && member.pointsBalance() >= threshold;
          int pointsToNext = rewardAvailable ? 0 : Math.max(0, threshold - member.pointsBalance());
          return new LoyaltyLookupResponse(
              true,
              settings.orderReadyNotificationsEnabled(),
              member.pointsBalance(),
              threshold,
              rewardAvailable,
              pointsToNext,
              member.name()
          );
        })
        .orElseGet(() -> new LoyaltyLookupResponse(
            true,
            settings.orderReadyNotificationsEnabled(),
            0,
            settings.loyaltyRewardThreshold(),
            false,
            settings.loyaltyRewardThreshold(),
            null
        ));
  }

  public record LoyaltyLookupResponse(
      boolean loyaltyEnabled,
      boolean orderReadyNotificationsEnabled,
      int pointsBalance,
      int rewardThreshold,
      boolean rewardAvailable,
      int pointsToNextReward,
      String memberName
  ) {}
}
