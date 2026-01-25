import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { map, of, shareReplay, switchMap } from 'rxjs';
import { TenantContextService } from './tenant-context.service';

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
  private readonly firestore = inject(Firestore);
  private readonly tenantContext = inject(TenantContextService);

  readonly settings$ = this.tenantContext.tenantId$.pipe(
    switchMap((tenantId) => {
      if (!tenantId) {
        return of(defaultSettings);
      }

      const settingsRef = doc(this.firestore, `tenants/${tenantId}/settings/general`);
      return docData(settingsRef).pipe(
        map((data) => ({
          ...defaultSettings,
          ...((data ?? {}) as Partial<TenantSettings>)
        }))
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  async updateSettings(changes: Partial<TenantSettings>): Promise<void> {
    const tenantId = await this.tenantContext.requireTenantId();
    const settingsRef = doc(this.firestore, `tenants/${tenantId}/settings/general`);
    await setDoc(settingsRef, changes, { merge: true });
  }
}
