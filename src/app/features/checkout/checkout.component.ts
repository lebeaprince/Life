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
            <label class="payment-option" *ngFor="let option of (controller.paymentOptions$ | async)">
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

        <div class="card-body">
          <div>
            <h5>Order ready notifications</h5>
            <p class="muted">Opt-in to notify the customer and enroll loyalty.</p>
          </div>
          <label class="field checkbox">
            <span>Notify customer when order is ready</span>
            <input type="checkbox" [formControl]="controller.notifyWhenReadyControl" />
          </label>

          <div *ngIf="controller.notifyWhenReadyControl.value" class="form-grid two-col">
            <label class="field">
              <span>Customer name</span>
              <input type="text" [formControl]="controller.customerNameControl" />
            </label>
            <label class="field">
              <span>Cellphone number</span>
              <input type="tel" [formControl]="controller.customerPhoneControl" />
            </label>
          </div>

          <div class="detail-list" *ngIf="controller.notifyWhenReadyControl.value">
            <ng-container *ngIf="controller.loyaltySummary$ | async as summary">
              <p class="muted" *ngIf="!summary.orderReadyNotificationsEnabled">
                Ready notifications are disabled in settings.
              </p>
              <p class="muted" *ngIf="!summary.loyaltyEnabled">
                Loyalty program is disabled in settings.
              </p>
              <div *ngIf="summary.loyaltyEnabled">
                <div class="detail-row">
                  <span>Points balance</span>
                  <strong>{{ summary.pointsBalance }}</strong>
                </div>
                <div class="detail-row">
                  <span>Points to free order</span>
                  <strong>{{ summary.pointsToNextReward }}</strong>
                </div>
                <label class="field checkbox" *ngIf="summary.rewardAvailable">
                  <span>Redeem free order</span>
                  <input type="checkbox" [formControl]="controller.redeemRewardControl" />
                </label>
              </div>
            </ng-container>
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
          <div class="summary-row" *ngIf="totals.discount > 0">
            <span>Loyalty reward</span>
            <span>-{{ totals.discount | currency }}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>{{ totals.total | currency }}</span>
          </div>
          <button
            class="btn btn-primary"
            (click)="controller.completeSale()"
            [disabled]="totals.subtotal <= 0"
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
