import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
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
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div class="table-row" *ngFor="let order of orderService.orders$ | async">
            <span>{{ order.id }}</span>
            <span>{{ order.items.length }}</span>
            <span>{{ order.total | currency }}</span>
            <span>{{ paymentTypeLabel(order.paymentType) }}</span>
            <span class="badge">{{ order.status | titlecase }}</span>
            <span>
              <button
                class="btn btn-ghost"
                (click)="markReady(order.id)"
                [disabled]="order.status === 'ready'"
              >
                Mark ready
              </button>
            </span>
          </div>
        </div>
      </div>
    </section>
  `
})
export class OrdersComponent {
  constructor(readonly orderService: OrderService) {}

  paymentTypeLabel(type?: PaymentType): string {
    if (!type) {
      return 'Unknown';
    }
    return PAYMENT_TYPE_LABELS[type];
  }

  async markReady(orderId: string): Promise<void> {
    await this.orderService.markOrderReady(orderId);
  }
}
