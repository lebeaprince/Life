import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, shareReplay, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Tenant } from './models';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  readonly tenant$ = this.authService.profile$.pipe(
    switchMap((profile) => {
      if (!profile) {
        return of(null);
      }
      return this.http.get<Tenant>(`${environment.apiBaseUrl}/tenants/me`);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
