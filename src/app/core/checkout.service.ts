import { Injectable } from '@angular/core';
import { combineLatest, firstValueFrom, map, take } from 'rxjs';
import { CartService } from './cart.service';
import { OrderService } from './order.service';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  readonly totals$ = combineLatest([
    this.cartService.subtotal$,
    this.cartService.tax$,
    this.cartService.total$
  ]).pipe(
    map(([subtotal, tax, total]) => ({
      subtotal,
      tax,
      total
    }))
  );

  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService
  ) {}

  async completeCheckout(): Promise<void> {
    const [items, totals] = await firstValueFrom(
      combineLatest([this.cartService.items$, this.totals$]).pipe(take(1))
    );

    if (!items.length) {
      return;
    }

    await this.orderService.createOrder({
      items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total
    });

    this.cartService.clear();
  }
}
