import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, shareReplay, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { InventoryAdjustment } from './models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  readonly adjustments$ = this.authService.profile$.pipe(
    switchMap((profile) => {
      if (!profile) {
        return of([] as InventoryAdjustment[]);
      }
      return this.http.get<InventoryAdjustment[]>(`${environment.apiBaseUrl}/inventory/adjustments`);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
