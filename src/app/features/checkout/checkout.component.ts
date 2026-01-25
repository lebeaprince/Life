import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CheckoutController } from '../../controllers/checkout.controller';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-grid two-col">
      <div class="card">
        <div class="card-header">
          <div>
            <h4>Checkout</h4>
            <p class="muted">Review the order before finalizing.</p>
          </div>
          <a class="btn btn-outline" routerLink="/app/pos">Back to POS</a>
        </div>

        <div class="cart-list" *ngIf="controller.items$ | async as items; else emptyCart">
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
            <p>No items in the cart.</p>
            <span class="muted">Return to POS to add products.</span>
          </div>
        </ng-template>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h4>Order summary</h4>
            <p class="muted">Payment collected at the counter.</p>
          </div>
        </div>

        <div class="card-body">
          <div>
            <h5>Payment type</h5>
            <p class="muted">Select the payment option for this sale.</p>
          </div>
          <div class="payment-options">
            <label class="payment-option" *ngFor="let option of controller.paymentOptions">
              <input
                type="radio"
                name="paymentType"
                [value]="option.value"
                [formControl]="controller.paymentTypeControl"
              />
              <div>
                <div class="payment-option-title">{{ option.label }}</div>
                <div class="muted">{{ option.description }}</div>
              </div>
            </label>
          </div>
        </div>

        <div class="cart-summary" *ngIf="controller.totals$ | async as totals">
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
            (click)="controller.completeSale()"
            [disabled]="totals.total <= 0"
          >
            Complete sale
          </button>
        </div>
      </div>
    </section>
  `
})
export class CheckoutComponent {
  constructor(readonly controller: CheckoutController) {}
}
