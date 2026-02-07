package com.nimbus.order.loyalty;

import com.nimbus.order.model.LoyaltyMember;
import com.nimbus.order.repository.LoyaltyMemberRepository;
import com.nimbus.order.security.PiiCryptoService;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class LoyaltyService {
  private final LoyaltyMemberRepository loyaltyMemberRepository;
  private final PiiCryptoService piiCryptoService;

  public LoyaltyService(
      LoyaltyMemberRepository loyaltyMemberRepository,
      PiiCryptoService piiCryptoService
  ) {
    this.loyaltyMemberRepository = loyaltyMemberRepository;
    this.piiCryptoService = piiCryptoService;
  }

  public Optional<LoyaltyLookup> lookupMember(String tenantId, String rawPhone) {
    String normalized = piiCryptoService.normalizePhone(rawPhone);
    if (normalized.isBlank()) {
      return Optional.empty();
    }
    String phoneHash = piiCryptoService.hashPhone(normalized);
    return loyaltyMemberRepository.findByTenantIdAndPhoneHash(tenantId, phoneHash)
        .map(member -> new LoyaltyLookup(
            member.getId(),
            piiCryptoService.decrypt(member.getNameEncrypted()),
            member.getPointsBalance(),
            member.getTotalOrders()
        ));
  }

  @Transactional
  public LoyaltyOutcome registerPurchase(
      String tenantId,
      String rawName,
      String rawPhone,
      LoyaltyProgramSettings settings,
      boolean redeemReward
  ) {
    Instant now = Instant.now();
    LoyaltyMember member = getOrCreateMember(tenantId, rawName, rawPhone, now);
    return applyRewards(member, settings, redeemReward, now);
  }

  @Transactional
  public LoyaltyOutcome applyRewards(
      LoyaltyMember member,
      LoyaltyProgramSettings settings,
      boolean redeemReward,
      Instant now
  ) {
    int pointsAwarded = Math.max(0, settings.loyaltyPointsPerOrder());
    int pointsRedeemed = 0;
    boolean rewardRedeemed = false;

    if (redeemReward && settings.loyaltyRewardThreshold() > 0
        && member.getPointsBalance() >= settings.loyaltyRewardThreshold()) {
      pointsRedeemed = settings.loyaltyRewardThreshold();
      rewardRedeemed = true;
      pointsAwarded = 0;
    }

    member.setTotalOrders(member.getTotalOrders() + 1);
    member.setPointsBalance(member.getPointsBalance() - pointsRedeemed + pointsAwarded);
    member.setUpdatedAt(now);
    loyaltyMemberRepository.save(member);

    return new LoyaltyOutcome(member, pointsAwarded, pointsRedeemed, rewardRedeemed);
  }

  private LoyaltyMember getOrCreateMember(
      String tenantId,
      String rawName,
      String rawPhone,
      Instant now
  ) {
    String normalizedPhone = piiCryptoService.normalizePhone(rawPhone);
    if (normalizedPhone.isBlank()) {
      throw new IllegalArgumentException("Customer phone is required for loyalty enrollment");
    }
    String phoneHash = piiCryptoService.hashPhone(normalizedPhone);
    LoyaltyMember member = loyaltyMemberRepository.findByTenantIdAndPhoneHash(tenantId, phoneHash)
        .orElseGet(() -> {
          LoyaltyMember created = new LoyaltyMember(UUID.randomUUID().toString(), tenantId);
          created.setCreatedAt(now);
          return created;
        });
    member.setTenantId(tenantId);
    member.setPhoneHash(phoneHash);
    member.setPhoneEncrypted(piiCryptoService.encrypt(normalizedPhone));
    member.setNameEncrypted(piiCryptoService.encrypt(safeTrim(rawName)));
    member.setUpdatedAt(now);
    return loyaltyMemberRepository.save(member);
  }

  private String safeTrim(String value) {
    return value == null ? "" : value.trim();
  }

  public record LoyaltyOutcome(
      LoyaltyMember member,
      int pointsAwarded,
      int pointsRedeemed,
      boolean rewardRedeemed
  ) {}

  public record LoyaltyLookup(
      String memberId,
      String name,
      int pointsBalance,
      int totalOrders
  ) {}
}
