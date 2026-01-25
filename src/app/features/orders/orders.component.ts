import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
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
            <span>Status</span>
          </div>
          <div class="table-row" *ngFor="let order of orderService.orders$ | async">
            <span>{{ order.id }}</span>
            <span>{{ order.items.length }}</span>
            <span>{{ order.total | currency }}</span>
            <span class="badge">{{ order.status | titlecase }}</span>
          </div>
        </div>
      </div>
    </section>
  `
})
export class OrdersComponent {
  constructor(readonly orderService: OrderService) {}
}
