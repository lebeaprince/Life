package com.nimbus.catalog.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final SecretKey key;

  public JwtService(@Value("${jwt.secret}") String secret) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }

  public TokenPrincipal parseToken(String token) {
    Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    String userId = claims.getSubject();
    String tenantId = claims.get("tenantId", String.class);
    String email = claims.get("email", String.class);
    String displayName = claims.get("displayName", String.class);
    List<?> rawRoles = claims.get("roles", List.class);
    List<String> roles = new ArrayList<>();
    if (rawRoles != null) {
      rawRoles.forEach(role -> roles.add(String.valueOf(role)));
    }
    return new TokenPrincipal(userId, tenantId, email, displayName, List.copyOf(roles));
  }
}
