import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserProfile } from './models';

export interface SignUpPayload {
  email: string;
  password: string;
  displayName: string;
  tenantName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly profileSubject = new BehaviorSubject<UserProfile | null>(null);

  readonly profile$ = this.profileSubject.asObservable();

  constructor() {
    this.restoreSession();
  }

  async signIn(email: string, password: string): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);
    const response = await this.requestAuthResponse(`${environment.apiBaseUrl}/auth/login`, {
      email: normalizedEmail,
      password
    });
    this.persistSession(response);
  }

  async signUp(payload: SignUpPayload): Promise<void> {
    const normalizedPayload: SignUpPayload = {
      ...payload,
      email: this.normalizeEmail(payload.email),
      displayName: this.normalizeName(payload.displayName),
      tenantName: this.normalizeName(payload.tenantName)
    };
    const response = await this.requestAuthResponse(
      `${environment.apiBaseUrl}/auth/register`,
      normalizedPayload
    );
    this.persistSession(response);
  }

  async signOut(): Promise<void> {
    this.clearSession();
  }

  getToken(): string | null {
    return localStorage.getItem('nimbus_token');
  }

  private restoreSession(): void {
    const token = this.getToken();
    if (!token) {
      return;
    }
    this.http.get<UserProfile>(`${environment.apiBaseUrl}/auth/me`).subscribe({
      next: (profile) => this.profileSubject.next(profile),
      error: () => {
        if (this.getToken() === token) {
          this.clearSession();
        }
      }
    });
  }

  private async requestAuthResponse(url: string, payload: unknown): Promise<AuthResponse> {
    const raw = await firstValueFrom(
      this.http.post(url, payload, {
        responseType: 'text' as const
      })
    );
    return this.parseAuthResponse(raw);
  }

  private parseAuthResponse(raw: string): AuthResponse {
    const sanitized = this.stripJsonPrefix(raw).trim();
    if (!sanitized) {
      throw new Error('Empty authentication response.');
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(sanitized);
    } catch {
      throw new Error('Unable to parse authentication response.');
    }
    const response = this.unwrapAuthResponse(parsed);
    if (!response) {
      throw new Error('Unexpected authentication response.');
    }
    return response;
  }

  private unwrapAuthResponse(payload: unknown): AuthResponse | null {
    if (this.isAuthResponse(payload)) {
      return payload;
    }
    if (payload && typeof payload === 'object') {
      const wrapped = payload as { data?: unknown };
      if (this.isAuthResponse(wrapped.data)) {
        return wrapped.data;
      }
    }
    return null;
  }

  private isAuthResponse(payload: unknown): payload is AuthResponse {
    if (!payload || typeof payload !== 'object') {
      return false;
    }
    const candidate = payload as { token?: unknown; profile?: unknown };
    return typeof candidate.token === 'string' && this.isUserProfile(candidate.profile);
  }

  private isUserProfile(payload: unknown): payload is UserProfile {
    if (!payload || typeof payload !== 'object') {
      return false;
    }
    const candidate = payload as { uid?: unknown; email?: unknown };
    return typeof candidate.uid === 'string' && typeof candidate.email === 'string';
  }

  private stripJsonPrefix(payload: string): string {
    const trimmed = payload.trimStart();
    const prefix = ")]}',";
    return trimmed.startsWith(prefix) ? trimmed.slice(prefix.length) : payload;
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem('nimbus_token', response.token);
    this.profileSubject.next(response.profile);
  }

  private clearSession(): void {
    localStorage.removeItem('nimbus_token');
    this.profileSubject.next(null);
  }

  private normalizeEmail(value: string): string {
    return value.trim().toLowerCase();
  }

  private normalizeName(value: string): string {
    return value.trim();
  }
}

interface AuthResponse {
  token: string;
  profile: UserProfile;
}
