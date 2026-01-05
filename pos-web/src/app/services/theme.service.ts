import { computed, Injectable, signal } from '@angular/core';
import type { ClientTheme } from './theme.types';

const STORAGE_KEY = 'pos.clientThemeId.v1';

const THEMES: ClientTheme[] = [
  {
    clientId: 'default',
    clientName: 'SaaS POS',
    brandMark: 'POS',
    supportPhone: '+1 (555) 010-2000',
    contactAddress: '100 Market Street, Suite 12, Springfield',
    backgroundColor: '#0b1020',
    surfaceColor: 'rgba(255, 255, 255, 0.06)',
    textColor: '#e8ecf7',
    mutedTextColor: 'rgba(232, 236, 247, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.10)',
    accentColor: '#8a2be2',
    accentColor2: '#ff5a7a',
    backgroundImageUrl: undefined
  },
  {
    clientId: 'demo',
    clientName: 'Bed & Breakfast Suite',
    brandMark: 'B&B',
    supportPhone: '+1 (555) 010-8899',
    contactAddress: '1 Ocean View Drive, Cape Town',
    backgroundColor: '#07121a',
    surfaceColor: 'rgba(255, 255, 255, 0.07)',
    textColor: '#edf7ff',
    mutedTextColor: 'rgba(237, 247, 255, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    accentColor: '#17b890',
    accentColor2: '#ffd166',
    backgroundImageUrl:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=60'
  }
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<ClientTheme>(this.loadTheme());

  readonly theme = this._theme.asReadonly();
  readonly allThemes = computed(() => THEMES);

  setThemeByClientId(clientId: string) {
    const t = THEMES.find((x) => x.clientId === clientId) ?? THEMES[0]!;
    this._theme.set(t);
    localStorage.setItem(STORAGE_KEY, t.clientId);
  }

  cycleTheme() {
    const idx = THEMES.findIndex((t) => t.clientId === this._theme().clientId);
    const next = THEMES[(idx + 1) % THEMES.length]!;
    this.setThemeByClientId(next.clientId);
  }

  private loadTheme(): ClientTheme {
    const stored = safeGetLocalStorage(STORAGE_KEY);
    return THEMES.find((x) => x.clientId === stored) ?? THEMES[0]!;
  }
}

function safeGetLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

