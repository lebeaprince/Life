import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CartService } from '../core/cart.service';
import { CheckoutService } from '../core/checkout.service';
import { PAYMENT_OPTIONS, PaymentType } from '../core/models';

@Injectable({ providedIn: 'root' })
export class CheckoutController {
  readonly items$ = this.cartService.items$;
  readonly totals$ = this.checkoutService.totals$;
  readonly paymentOptions = PAYMENT_OPTIONS;
  readonly paymentTypeControl = new FormControl<PaymentType>(PAYMENT_OPTIONS[0].value, {
    nonNullable: true
  });

  constructor(
    private readonly cartService: CartService,
    private readonly checkoutService: CheckoutService
  ) {}

  removeItem(productId: string): void {
    this.cartService.removeItem(productId);
  }

  updateQuantity(productId: string, rawValue: string): void {
    const quantity = Number.parseInt(rawValue, 10);
    if (!Number.isNaN(quantity)) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  async completeSale(): Promise<void> {
    await this.checkoutService.completeCheckout(this.paymentTypeControl.value);
  }
}
