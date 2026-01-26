import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CartService } from '../core/cart.service';
import { CheckoutService } from '../core/checkout.service';
import { Observable } from 'rxjs';
import { CartItem, PaymentType } from '../core/models';

@Injectable({ providedIn: 'root' })
export class CheckoutController {
  readonly items$: Observable<CartItem[]>;
  readonly totals$: Observable<any>;
  paymentTypeControl = new FormControl('');
  paymentOptions: any;

  constructor(
    private readonly cartService: CartService,
    private readonly checkoutService: CheckoutService
  ) {
    this.items$ = this.cartService.items$;
    this.totals$ = this.checkoutService.totals$;
    this.paymentOptions = this.checkoutService.paymentOptions$;
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
    await this.checkoutService.completeCheckout(this.paymentTypeControl.value as PaymentType ?? undefined);
  }
}
