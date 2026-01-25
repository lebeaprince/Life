import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { map, of, shareReplay, switchMap } from 'rxjs';
import { Tenant } from './models';
import { TenantContextService } from './tenant-context.service';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly firestore = inject(Firestore);
  private readonly tenantContext = inject(TenantContextService);

  readonly tenant$ = this.tenantContext.tenantId$.pipe(
    switchMap((tenantId) => {
      if (!tenantId) {
        return of(null);
      }

      const tenantRef = doc(this.firestore, `tenants/${tenantId}`);
      return docData(tenantRef, { idField: 'id' }).pipe(map((data) => data as Tenant));
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
