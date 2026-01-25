import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  increment,
  orderBy,
  query,
  serverTimestamp,
  writeBatch
} from '@angular/fire/firestore';
import { filter, firstValueFrom, map, of, shareReplay, switchMap, take } from 'rxjs';
import { AuthService } from './auth.service';
import { CartItem, Order, PaymentType } from './models';
import { TenantContextService } from './tenant-context.service';

export interface OrderInput {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentType: PaymentType;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly tenantContext = inject(TenantContextService);

  readonly orders$ = this.tenantContext.tenantId$.pipe(
    switchMap((tenantId) => {
      if (!tenantId) {
        return of([] as Order[]);
      }

      const ordersRef = collection(this.firestore, `tenants/${tenantId}/orders`);
      const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
      return collectionData(ordersQuery, { idField: 'id' }).pipe(map((data) => data as Order[]));
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  async createOrder(input: OrderInput): Promise<void> {
    const tenantId = await this.tenantContext.requireTenantId();
    const userId = await this.requireUserId();
    const ordersRef = collection(this.firestore, `tenants/${tenantId}/orders`);
    const orderRef = doc(ordersRef);

    const batch = writeBatch(this.firestore);

    batch.set(orderRef, {
      items: input.items,
      subtotal: input.subtotal,
      tax: input.tax,
      total: input.total,
      paymentType: input.paymentType,
      createdBy: userId,
      status: 'paid',
      createdAt: serverTimestamp()
    });

    input.items.forEach((item) => {
      const productRef = doc(this.firestore, `tenants/${tenantId}/products/${item.productId}`);
      batch.update(productRef, {
        stock: increment(-item.quantity),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
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
