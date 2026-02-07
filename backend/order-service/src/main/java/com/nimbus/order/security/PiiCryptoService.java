package com.nimbus.order.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PiiCryptoService {
  private static final String CIPHER = "AES/GCM/NoPadding";
  private static final int GCM_TAG_LENGTH = 128;
  private static final int IV_LENGTH = 12;

  private final SecretKeySpec secretKey;
  private final String hashPepper;
  private final SecureRandom random = new SecureRandom();

  public PiiCryptoService(
      @Value("${pii.encryption-key}") String encryptionKey,
      @Value("${pii.hash-pepper}") String hashPepper
  ) {
    this.secretKey = new SecretKeySpec(hashKey(encryptionKey), "AES");
    this.hashPepper = hashPepper == null ? "" : hashPepper;
  }

  public String normalizePhone(String raw) {
    if (raw == null) {
      return "";
    }
    String trimmed = raw.trim();
    if (trimmed.isEmpty()) {
      return "";
    }
    StringBuilder normalized = new StringBuilder();
    for (int i = 0; i < trimmed.length(); i++) {
      char ch = trimmed.charAt(i);
      if (Character.isDigit(ch)) {
        normalized.append(ch);
      } else if (ch == '+' && normalized.length() == 0) {
        normalized.append(ch);
      }
    }
    return normalized.toString();
  }

  public String hashPhone(String normalizedPhone) {
    if (normalizedPhone == null || normalizedPhone.isBlank()) {
      return "";
    }
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      digest.update(hashPepper.getBytes(StandardCharsets.UTF_8));
      digest.update(normalizedPhone.getBytes(StandardCharsets.UTF_8));
      return Base64.getEncoder().encodeToString(digest.digest());
    } catch (Exception ex) {
      throw new IllegalStateException("Unable to hash phone number", ex);
    }
  }

  public String encrypt(String plaintext) {
    if (plaintext == null || plaintext.isBlank()) {
      return null;
    }
    try {
      byte[] iv = new byte[IV_LENGTH];
      random.nextBytes(iv);
      Cipher cipher = Cipher.getInstance(CIPHER);
      GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
      cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);
      byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
      return Base64.getEncoder().encodeToString(iv) + ":" +
          Base64.getEncoder().encodeToString(ciphertext);
    } catch (Exception ex) {
      throw new IllegalStateException("Unable to encrypt value", ex);
    }
  }

  public String decrypt(String encrypted) {
    if (encrypted == null || encrypted.isBlank()) {
      return null;
    }
    String[] parts = encrypted.split(":", 2);
    if (parts.length != 2) {
      throw new IllegalArgumentException("Invalid encrypted payload");
    }
    try {
      byte[] iv = Base64.getDecoder().decode(parts[0]);
      byte[] ciphertext = Base64.getDecoder().decode(parts[1]);
      Cipher cipher = Cipher.getInstance(CIPHER);
      GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
      cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);
      byte[] plaintext = cipher.doFinal(ciphertext);
      return new String(plaintext, StandardCharsets.UTF_8);
    } catch (Exception ex) {
      throw new IllegalStateException("Unable to decrypt value", ex);
    }
  }

  private byte[] hashKey(String keyMaterial) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      return digest.digest(keyMaterial.getBytes(StandardCharsets.UTF_8));
    } catch (Exception ex) {
      throw new IllegalStateException("Unable to derive encryption key", ex);
    }
  }
}
