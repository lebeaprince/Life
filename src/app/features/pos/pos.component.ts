import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, firstValueFrom, map, startWith, take } from 'rxjs';
import { CartService } from '../../core/cart.service';
import { OrderService } from '../../core/order.service';
import { ProductService } from '../../core/product.service';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <section class="page-grid two-col">
      <div class="card">
        <div class="card-header">
          <div>
            <h4>Catalog</h4>
            <p class="muted">Tap an item to add it to the cart.</p>
          </div>
          <input
            class="input"
            type="search"
            [formControl]="searchControl"
            placeholder="Search products"
          />
        </div>
        <div class="product-grid">
          <button
            class="product-card"
            *ngFor="let product of filteredProducts$ | async"
            (click)="cartService.addItem(product)"
          >
            <div class="product-card-title">{{ product.name }}</div>
            <div class="product-card-meta">
              <span>{{ product.price | currency }}</span>
              <span class="muted">Stock: {{ product.stock }}</span>
            </div>
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h4>Cart</h4>
            <p class="muted">Review items before checkout.</p>
          </div>
          <button class="btn btn-outline" (click)="cartService.clear()">Clear</button>
        </div>

        <div class="cart-list" *ngIf="cartItems$ | async as items; else emptyCart">
          <div class="cart-row" *ngFor="let item of items">
            <div>
              <p>{{ item.name }}</p>
              <span class="muted">{{ item.price | currency }}</span>
            </div>
            <div class="cart-actions">
              <input
                type="number"
                min="1"
                class="input qty-input"
                [value]="item.quantity"
                (change)="updateQuantity(item.productId, $any($event.target).value)"
              />
              <button class="btn btn-ghost" (click)="cartService.removeItem(item.productId)">
                Remove
              </button>
            </div>
          </div>
        </div>

        <ng-template #emptyCart>
          <div class="empty-state">
            <p>Your cart is empty.</p>
            <span class="muted">Select products to start a new order.</span>
          </div>
        </ng-template>

        <div class="cart-summary" *ngIf="cartTotals$ | async as totals">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{ totals.subtotal | currency }}</span>
          </div>
          <div class="summary-row">
            <span>Tax</span>
            <span>{{ totals.tax | currency }}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>{{ totals.total | currency }}</span>
          </div>
          <button
            class="btn btn-primary"
            (click)="checkout()"
            [disabled]="totals.total <= 0"
          >
            Complete sale
          </button>
        </div>
      </div>
    </section>
  `
})
export class PosComponent {
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly cartItems$ = this.cartService.items$;
  readonly cartTotals$ = combineLatest([
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

  readonly filteredProducts$ = combineLatest([
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

  constructor(
    readonly cartService: CartService,
    private readonly productService: ProductService,
    private readonly orderService: OrderService
  ) {}

  updateQuantity(productId: string, rawValue: string): void {
    const quantity = Number.parseInt(rawValue, 10);
    if (!Number.isNaN(quantity)) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  async checkout(): Promise<void> {
    const [items, totals] = await firstValueFrom(
      combineLatest([this.cartService.items$, this.cartTotals$]).pipe(take(1))
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
