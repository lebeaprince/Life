import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  orderBy,
  query
} from '@angular/fire/firestore';
import { map, of, shareReplay, switchMap } from 'rxjs';
import { InventoryAdjustment } from './models';
import { TenantContextService } from './tenant-context.service';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly firestore = inject(Firestore);
  private readonly tenantContext = inject(TenantContextService);

  readonly adjustments$ = this.tenantContext.tenantId$.pipe(
    switchMap((tenantId) => {
      if (!tenantId) {
        return of([] as InventoryAdjustment[]);
      }

      const adjustmentsRef = collection(
        this.firestore,
        `tenants/${tenantId}/inventoryAdjustments`
      );
      const adjustmentsQuery = query(adjustmentsRef, orderBy('createdAt', 'desc'));
      return collectionData(adjustmentsQuery, { idField: 'id' }).pipe(
        map((data) => data as InventoryAdjustment[])
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
