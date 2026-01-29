import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CartService } from '../core/cart.service';
import { CheckoutService } from '../core/checkout.service';
import { Observable } from 'rxjs';
import { CartItem, PaymentType, PAYMENT_OPTIONS } from '../core/models';

@Injectable({ providedIn: 'root' })
export class CheckoutController {
  readonly items$: Observable<CartItem[]>;
  readonly totals$: Observable<any>;
  readonly paymentOptions = PAYMENT_OPTIONS;
  readonly paymentTypeControl = new FormControl<PaymentType>('cash', { nonNullable: true });

  constructor(
    private readonly cartService: CartService,
    private readonly checkoutService: CheckoutService
  ) {
    this.items$ = this.cartService.items$;
    this.totals$ = this.checkoutService.totals$;
  }

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
