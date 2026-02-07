package com.nimbus.order.service;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PhoneProtectionService {
  private static final int GCM_IV_LENGTH = 12;
  private static final int GCM_TAG_LENGTH = 128;

  private final SecretKeySpec secretKey;
  private final SecureRandom secureRandom = new SecureRandom();

  public PhoneProtectionService(
      @Value("${notification.encryption-key}") String encryptionKey
  ) {
    if (encryptionKey == null || encryptionKey.isBlank()) {
      throw new IllegalStateException("Notification encryption key is required");
    }
    this.secretKey = new SecretKeySpec(hashKey(encryptionKey), "AES");
  }

  public PhoneDetails protect(String rawPhoneNumber) {
    String normalized = normalize(rawPhoneNumber);
    return new PhoneDetails(
        normalized,
        mask(normalized),
        hash(normalized),
        encrypt(normalized)
    );
  }

  public String decrypt(String encryptedPhone) {
    try {
      byte[] payload = Base64.getDecoder().decode(encryptedPhone);
      if (payload.length <= GCM_IV_LENGTH) {
        throw new IllegalArgumentException("Invalid encrypted phone payload");
      }
      byte[] iv = Arrays.copyOfRange(payload, 0, GCM_IV_LENGTH);
      byte[] cipherText = Arrays.copyOfRange(payload, GCM_IV_LENGTH, payload.length);
      Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
      cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
      byte[] plaintext = cipher.doFinal(cipherText);
      return new String(plaintext, StandardCharsets.UTF_8);
    } catch (GeneralSecurityException ex) {
      throw new IllegalStateException("Unable to decrypt phone number", ex);
    }
  }

  private String normalize(String rawPhoneNumber) {
    if (rawPhoneNumber == null) {
      throw new IllegalArgumentException("Cellphone number is required");
    }
    String digits = rawPhoneNumber.replaceAll("\\D", "");
    if (digits.isBlank()) {
      throw new IllegalArgumentException("Cellphone number is required");
    }
    if (digits.startsWith("00")) {
      digits = digits.substring(2);
    }
    if (digits.startsWith("0") && digits.length() == 10) {
      digits = "27" + digits.substring(1);
    }
    if (digits.length() < 10 || digits.length() > 15) {
      throw new IllegalArgumentException("Cellphone number must include 10 to 15 digits");
    }
    return "+" + digits;
  }

  private String mask(String normalized) {
    String digits = normalized.replaceAll("\\D", "");
    String last4 = digits.length() <= 4 ? digits : digits.substring(digits.length() - 4);
    return "****" + last4;
  }

  private String hash(String normalized) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hashed = digest.digest(normalized.getBytes(StandardCharsets.UTF_8));
      return toHex(hashed);
    } catch (GeneralSecurityException ex) {
      throw new IllegalStateException("Unable to hash phone number", ex);
    }
  }

  private String encrypt(String normalized) {
    try {
      byte[] iv = new byte[GCM_IV_LENGTH];
      secureRandom.nextBytes(iv);
      Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
      cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
      byte[] cipherText = cipher.doFinal(normalized.getBytes(StandardCharsets.UTF_8));
      byte[] payload = new byte[iv.length + cipherText.length];
      System.arraycopy(iv, 0, payload, 0, iv.length);
      System.arraycopy(cipherText, 0, payload, iv.length, cipherText.length);
      return Base64.getEncoder().encodeToString(payload);
    } catch (GeneralSecurityException ex) {
      throw new IllegalStateException("Unable to encrypt phone number", ex);
    }
  }

  private byte[] hashKey(String encryptionKey) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      return digest.digest(encryptionKey.getBytes(StandardCharsets.UTF_8));
    } catch (GeneralSecurityException ex) {
      throw new IllegalStateException("Unable to derive encryption key", ex);
    }
  }

  private String toHex(byte[] bytes) {
    StringBuilder builder = new StringBuilder(bytes.length * 2);
    for (byte value : bytes) {
      builder.append(String.format("%02x", value));
    }
    return builder.toString();
  }

  public record PhoneDetails(
      String normalized,
      String masked,
      String hash,
      String encrypted
  ) {}
}
