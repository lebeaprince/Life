import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of, shareReplay, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface TenantSettings {
  currency: string;
  taxRate: number;
  lowStockThreshold: number;
}

const defaultSettings: TenantSettings = {
  currency: 'USD',
  taxRate: 0.08,
  lowStockThreshold: 5
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  readonly settings$ = this.authService.profile$.pipe(
    switchMap((profile) => {
      if (!profile) {
        return of(defaultSettings);
      }
      return this.http.get<TenantSettings>(`${environment.apiBaseUrl}/settings`);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  async updateSettings(changes: Partial<TenantSettings>): Promise<void> {
    await firstValueFrom(this.http.put(`${environment.apiBaseUrl}/settings`, changes));
  }
}
