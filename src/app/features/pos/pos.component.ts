import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PosController } from '../../controllers/pos.controller';

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
            [formControl]="controller.searchControl"
            placeholder="Search products"
          />
        </div>
        <div class="product-grid">
          <button
            class="product-card"
            *ngFor="let product of controller.filteredProducts$ | async"
            (click)="controller.addItem(product)"
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
          <button class="btn btn-outline" (click)="controller.clearCart()">Clear</button>
        </div>

        <div class="cart-list" *ngIf="controller.cartItems$ | async as items; else emptyCart">
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
                (change)="controller.updateQuantity(item.productId, $any($event.target).value)"
              />
              <button class="btn btn-ghost" (click)="controller.removeItem(item.productId)">
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

        <div class="cart-summary" *ngIf="controller.cartTotals$ | async as totals">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{ totals['subtotal'] | currency }}</span>
          </div>
          <div class="summary-row">
            <span>Tax</span>
            <span>{{ totals['tax'] | currency }}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>{{ totals['total'] | currency }}</span>
          </div>
          <button
            class="btn btn-primary"
            (click)="controller.checkout()"
            [disabled]="totals['total'] <= 0"
          >
            Complete sale
          </button>
        </div>
      </div>
    </section>
  `
})
export class PosComponent {
  constructor(readonly controller: PosController) {}
}
