package com.nimbus.identity.controller;

import com.nimbus.identity.config.JwtService;
import com.nimbus.identity.config.RequestContext;
import com.nimbus.identity.model.User;
import com.nimbus.identity.store.IdentityStore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private static final DateTimeFormatter ISO_FORMATTER =
      DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC);

  private final IdentityStore identityStore;
  private final JwtService jwtService;

  public AuthController(IdentityStore identityStore, JwtService jwtService) {
    this.identityStore = identityStore;
    this.jwtService = jwtService;
  }

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        System.out.println("/register::::::"+request.email());
    try {
      User user = identityStore.register(
          request.email(),
          request.password(),
          request.displayName(),
          request.tenantName()
      );
      return new AuthResponse(jwtService.generateToken(user), toProfile(user));
    } catch (IllegalArgumentException ex) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, ex.getMessage(), ex);
    }
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
         System.out.println("/login::::::"+request.email());   
    User user = identityStore.authenticate(request.email(), request.password())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
    return new AuthResponse(jwtService.generateToken(user), toProfile(user));
  }

  @GetMapping("/me")
  public UserProfile me() {
    String userId = RequestContext.require().userId();
    User user = identityStore.findUser(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    return toProfile(user);
  }

  private UserProfile toProfile(User user) {
    String createdAt = user.getCreatedAt() == null ? null : ISO_FORMATTER.format(user.getCreatedAt());
    return new UserProfile(
        user.getId(),
        user.getEmail(),
        user.getDisplayName(),
        user.getTenantId(),
        user.getRoles(),
        createdAt
    );
  }

  public record RegisterRequest(
      @NotBlank @Email String email,
      @NotBlank @Size(min = 8) String password,
      @NotBlank @Size(min = 2) String displayName,
      @NotBlank @Size(min = 2) String tenantName
  ) {}

  public record LoginRequest(
      @NotBlank @Email String email,
      @NotBlank String password
  ) {}

  public record AuthResponse(
      String token,
      UserProfile profile
  ) {}

  public record UserProfile(
      String uid,
      String email,
      String displayName,
      String tenantId,
      java.util.List<String> roles,
      String createdAt
  ) {}
}
