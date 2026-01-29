package com.nimbus.order.config;

public final class RequestContext {
  private static final ThreadLocal<TokenPrincipal> CURRENT = new ThreadLocal<>();

  private RequestContext() {}

  public static void set(TokenPrincipal principal) {
    CURRENT.set(principal);
  }

  public static TokenPrincipal get() {
    return CURRENT.get();
  }

  public static TokenPrincipal require() {
    TokenPrincipal principal = CURRENT.get();
    if (principal == null) {
      throw new IllegalStateException("No authenticated principal available");
    }
    return principal;
  }

  public static void clear() {
    CURRENT.remove();
  }
}
