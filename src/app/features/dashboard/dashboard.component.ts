import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { OrderService } from '../../core/order.service';
import { ProductService } from '../../core/product.service';
import { TenantService } from '../../core/tenant.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <section class="page-grid">
      <div class="card stat">
        <p>Revenue</p>
        <h3>{{ (stats$ | async)?.revenue | currency }}</h3>
        <span class="muted">All time</span>
      </div>
      <div class="card stat">
        <p>Orders</p>
        <h3>{{ (stats$ | async)?.orders }}</h3>
        <span class="muted">Completed</span>
      </div>
      <div class="card stat">
        <p>Active products</p>
        <h3>{{ (stats$ | async)?.activeProducts }}</h3>
        <span class="muted">Selling now</span>
      </div>
      <div class="card stat">
        <p>Low stock</p>
        <h3>{{ (stats$ | async)?.lowStock }}</h3>
        <span class="muted">Needs reorder</span>
      </div>
    </section>

    <section class="page-grid two-col">
      <div class="card">
        <div class="card-header">
          <h4>Workspace snapshot</h4>
          <span class="badge">Realtime</span>
        </div>
        <div class="card-body">
          <p class="muted">
            Monitor the health of your store and keep the team aligned on the day ahead.
          </p>
          <ul class="list" *ngIf="stats$ | async as stats">
            <li>Average ticket: {{ stats.averageOrder | currency }}</li>
            <li>Tax collected: {{ stats.taxCollected | currency }}</li>
            <li>Active SKUs: {{ stats.activeProducts }}</li>
          </ul>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h4>Plan details</h4>
          <span class="badge badge-outline">SaaS</span>
        </div>
        <div class="card-body" *ngIf="tenantService.tenant$ | async as tenant">
          <p class="muted">Plan: {{ tenant.plan | titlecase }}</p>
          <p class="muted">Workspace ID: {{ tenant.id }}</p>
          <p class="muted">Owner: {{ tenant.ownerUid }}</p>
        </div>
        <div class="card-body" *ngIf="!(tenantService.tenant$ | async)">
          <p class="muted">Connect a workspace to see your plan details.</p>
        </div>
      </div>
    </section>
  `
})
export class DashboardComponent {
  readonly stats$ = combineLatest([this.productService.products$, this.orderService.orders$]).pipe(
    map(([products, orders]) => {
      const revenue = orders.reduce((sum, order) => sum + order.total, 0);
      const taxCollected = orders.reduce((sum, order) => sum + order.tax, 0);
      const averageOrder = orders.length ? revenue / orders.length : 0;
      const activeProducts = products.filter((product) => product.active).length;
      const lowStock = products.filter((product) => product.stock <= 5).length;

      return {
        revenue,
        orders: orders.length,
        averageOrder,
        taxCollected,
        activeProducts,
        lowStock
      };
    })
  );

  constructor(
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
    readonly tenantService: TenantService
  ) {}
}
