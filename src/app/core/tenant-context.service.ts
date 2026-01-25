import { Injectable, inject } from '@angular/core';
import { filter, map, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private readonly authService = inject(AuthService);

  readonly tenantId$ = this.authService.profile$.pipe(
    map((profile) => profile?.tenantId ?? null),
    distinctUntilChanged()
  );

  async requireTenantId(): Promise<string> {
    return firstValueFrom(this.tenantId$.pipe(filter((tenantId): tenantId is string => !!tenantId)));
  }
}
