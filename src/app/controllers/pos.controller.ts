import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, map, startWith } from 'rxjs';
import { CartService } from '../core/cart.service';
import { CheckoutService } from '../core/checkout.service';
import { ProductService } from '../core/product.service';
import { Product } from '../core/models';

@Injectable({ providedIn: 'root' })
export class PosController {
  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly cartItems$: CartService['items$'];
  readonly cartTotals$: CheckoutService['totals$'];
  readonly filteredProducts$;

  constructor(
    private readonly cartService: CartService,
    private readonly checkoutService: CheckoutService,
    private readonly productService: ProductService
  ) {
    this.cartItems$ = this.cartService.items$;
    this.cartTotals$ = this.checkoutService.totals$;
    this.filteredProducts$ = combineLatest([
      this.productService.products$,
      this.searchControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([products, query]) => {
        const term = query.trim().toLowerCase();
        return products.filter((product) => {
          const matches =
            !term ||
            product.name.toLowerCase().includes(term) ||
            product.sku.toLowerCase().includes(term);
          return product.active && product.stock > 0 && matches;
        });
      })
    );
  }

  addItem(product: Product): void {
    this.cartService.addItem(product);
  }

  updateQuantity(productId: string, rawValue: string): void {
    const quantity = Number.parseInt(rawValue, 10);
    if (!Number.isNaN(quantity)) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  removeItem(productId: string): void {
    this.cartService.removeItem(productId);
  }

  clearCart(): void {
    this.cartService.clear();
  }

  async checkout(): Promise<void> {
    await this.checkoutService.completeCheckout({
      paymentType: 'cash',
      notifyWhenReady: false,
      customerName: '',
      customerPhone: '',
      redeemReward: false,
      totalOverride: 0
    });
  }
}
