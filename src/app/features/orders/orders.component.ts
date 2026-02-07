import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { PAYMENT_TYPE_LABELS, PaymentType } from '../../core/models';
import { OrderService } from '../../core/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <section class="page-grid">
      <div class="card">
        <div class="card-header">
          <div>
            <h4>Recent orders</h4>
            <p class="muted">Track completed sales across the team.</p>
          </div>
        </div>

        <div class="table">
          <div class="table-row header">
            <span>Order ID</span>
            <span>Items</span>
            <span>Total</span>
            <span>Payment</span>
            <span>Customer</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div class="table-row" *ngFor="let order of orderService.orders$ | async">
            <span>{{ order.id }}</span>
            <span>{{ order.items.length }}</span>
            <span>{{ order.total | currency }}</span>
            <span>{{ paymentTypeLabel(order.paymentType) }}</span>
            <span>
              <ng-container *ngIf="order.notification; else noNotification">
                {{ order.notification.customerName }}<br />
                <span class="muted">{{ order.notification.phoneMasked }}</span>
              </ng-container>
              <ng-template #noNotification>
                <span class="muted">No SMS</span>
              </ng-template>
            </span>
            <span class="badge">{{ order.status | titlecase }}</span>
            <span>
              <button
                class="btn btn-ghost"
                (click)="markReady(order.id)"
                [disabled]="order.status !== 'paid'"
              >
                {{ order.status === 'ready' ? 'Ready' : 'Mark ready' }}
              </button>
            </span>
          </div>
        </div>

        <p class="form-error" *ngIf="errorMessage()">
          {{ errorMessage() }}
        </p>
      </div>
    </section>
  `
})
export class OrdersComponent {
  readonly errorMessage = signal<string | null>(null);

  constructor(readonly orderService: OrderService) {}

  paymentTypeLabel(type?: PaymentType): string {
    if (!type) {
      return 'Unknown';
    }
    return PAYMENT_TYPE_LABELS[type];
  }

  async markReady(orderId: string): Promise<void> {
    try {
      this.errorMessage.set(null);
      await this.orderService.markReady(orderId);
    } catch (error) {
      console.error(error);
      this.errorMessage.set(this.resolveErrorMessage(error));
    }
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 404) {
        return 'Order not found.';
      }
      if (error.status === 502) {
        return 'Unable to send SMS notification. Please try again.';
      }
      if (error.status === 500) {
        return 'Unable to read notification details.';
      }
    }
    return 'Unable to update order status. Please try again.';
  }
}
