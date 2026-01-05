import { computed, Injectable, signal } from '@angular/core';

export type UserSession = {
  userId: string;
  email: string;
  displayName: string;
  clientId: string;
};

const STORAGE_KEY = 'pos.session.v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<UserSession | null>(this.load());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() != null);

  login(input: { email: string; password: string }): { ok: true } | { ok: false; message: string } {
    const email = input.email.trim().toLowerCase();
    const password = input.password;

    if (!email || !password) return { ok: false, message: 'Email and password are required.' };

    // Demo auth: accept any non-empty credentials.
    const displayName = email.split('@')[0] || 'User';
    const session: UserSession = {
      userId: `user_${hashString(email)}`,
      email,
      displayName,
      clientId: email.includes('demo') ? 'demo' : 'default'
    };

    this._user.set(session);
    this.persist(session);
    return { ok: true };
  }

  logout() {
    this._user.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private persist(session: UserSession) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  private load(): UserSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<UserSession>;
      if (!parsed || typeof parsed !== 'object') return null;
      if (!parsed.userId || !parsed.email || !parsed.displayName || !parsed.clientId) return null;
      return parsed as UserSession;
    } catch {
      return null;
    }
  }
}

function hashString(input: string) {
  // Small deterministic hash for demo IDs.
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

