import { Injectable } from '@angular/core';
import { combineLatest, firstValueFrom, map, Observable, of, take } from 'rxjs';
import { CartService } from './cart.service';
import { OrderNotificationInput, OrderService } from './order.service';
import { PaymentOption, PAYMENT_OPTIONS, PaymentType } from './models';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  readonly totals$!: ReturnType<typeof combineLatest>;
  readonly paymentOptions$: Observable<PaymentOption[]> = of(PAYMENT_OPTIONS);

  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService
  ) {
    this.totals$ = combineLatest([
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
  }

  async completeCheckout(
    paymentType: PaymentType = 'cash',
    notification?: OrderNotificationInput | null
  ): Promise<void> {
    const [items, totals] = await firstValueFrom(
      combineLatest([this.cartService.items$, this.totals$]).pipe(take(1))
    );

    if (!items.length) {
      return;
    }

    await this.orderService.createOrder({
      items,
      subtotal: totals['subtotal'],
      tax: totals['tax'],
      total: totals['total'],
      paymentType,
      notification: notification ?? undefined
    });

    this.cartService.clear();
  }
}
