import { Injectable } from '@angular/core';
import { combineLatest, firstValueFrom, map, Observable, of, take } from 'rxjs';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { PaymentOption, PAYMENT_OPTIONS, PaymentType } from './models';

export interface CheckoutOptions {
  paymentType: PaymentType;
  notifyWhenReady: boolean;
  customerName: string;
  customerPhone: string;
  redeemReward: boolean;
  totalOverride?: number;
}

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

  async completeCheckout(options: CheckoutOptions): Promise<void> {
    const [items, totals] = await firstValueFrom(
      combineLatest([this.cartService.items$, this.totals$]).pipe(take(1))
    );

    if (!items.length) {
      return;
    }

    const total = options.redeemReward ? 0 : totals['total'];
    const totalOverride = options.totalOverride;
    const finalTotal = typeof totalOverride === 'number' ? totalOverride : total;

    await this.orderService.createOrder({
      items,
      subtotal: totals['subtotal'],
      tax: totals['tax'],
      total: finalTotal,
      paymentType: options.paymentType,
      notifyWhenReady: options.notifyWhenReady,
      customerName: options.notifyWhenReady ? options.customerName : undefined,
      customerPhone: options.notifyWhenReady ? options.customerPhone : undefined,
      redeemReward: options.redeemReward
    });

    this.cartService.clear();
  }
}
