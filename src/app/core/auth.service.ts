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
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, {
        email,
        password
      })
    );
    this.persistSession(response);
  }

  async signUp(payload: SignUpPayload): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/register`, payload)
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
      error: () => this.clearSession()
    });
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem('nimbus_token', response.token);
    this.profileSubject.next(response.profile);
  }

  private clearSession(): void {
    localStorage.removeItem('nimbus_token');
    this.profileSubject.next(null);
  }
}

interface AuthResponse {
  token: string;
  profile: UserProfile;
}
