import { Injectable } from '@angular/core';
import { CartService } from '../core/cart.service';
import { CheckoutService } from '../core/checkout.service';

@Injectable({ providedIn: 'root' })
export class CheckoutController {
  readonly items$ = this.cartService.items$;
  readonly totals$ = this.checkoutService.totals$;

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
    await this.checkoutService.completeCheckout();
  }
}
