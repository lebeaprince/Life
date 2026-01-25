import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from '@angular/fire/firestore';
import { filter, firstValueFrom, map, of, shareReplay, switchMap, take } from 'rxjs';
import { AuthService } from './auth.service';
import { Product } from './models';
import { TenantContextService } from './tenant-context.service';

export interface ProductInput {
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  taxRate: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly tenantContext = inject(TenantContextService);

  readonly products$ = this.tenantContext.tenantId$.pipe(
    switchMap((tenantId) => {
      if (!tenantId) {
        return of([] as Product[]);
      }

      const productsRef = collection(this.firestore, `tenants/${tenantId}/products`);
      const productsQuery = query(productsRef, orderBy('name'));
      return collectionData(productsQuery, { idField: 'id' }).pipe(map((data) => data as Product[]));
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  async addProduct(input: ProductInput): Promise<void> {
    const tenantId = await this.tenantContext.requireTenantId();
    const productsRef = collection(this.firestore, `tenants/${tenantId}/products`);

    await addDoc(productsRef, {
      ...input,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async updateProduct(productId: string, changes: Partial<Product>): Promise<void> {
    const tenantId = await this.tenantContext.requireTenantId();
    const productRef = doc(this.firestore, `tenants/${tenantId}/products/${productId}`);
    await updateDoc(productRef, {
      ...changes,
      updatedAt: serverTimestamp()
    });
  }

  async adjustStock(productId: string, delta: number, reason: string): Promise<void> {
    const tenantId = await this.tenantContext.requireTenantId();
    const userId = await this.requireUserId();
    const productRef = doc(this.firestore, `tenants/${tenantId}/products/${productId}`);
    const adjustmentsRef = collection(
      this.firestore,
      `tenants/${tenantId}/inventoryAdjustments`
    );

    await updateDoc(productRef, {
      stock: increment(delta),
      updatedAt: serverTimestamp()
    });

    await addDoc(adjustmentsRef, {
      productId,
      delta,
      reason,
      createdBy: userId,
      createdAt: serverTimestamp()
    });
  }

  private async requireUserId(): Promise<string> {
    return firstValueFrom(
      this.authService.user$.pipe(
        filter((user): user is NonNullable<typeof user> => !!user),
        take(1),
        map((user) => user.uid)
      )
    );
  }
}
