import { Injectable } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { OrderService } from './order.service';
import { ProductService } from './product.service';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class MetricsService {
  readonly summary$ = this.createSummary();

  constructor(
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
    private readonly settingsService: SettingsService
  ) {}

  private createSummary() {
    return combineLatest([
      this.productService.products$,
      this.orderService.orders$,
      this.settingsService.settings$
    ]).pipe(
      map(([products, orders, settings]) => {
        const revenue = orders.reduce((sum, order) => sum + order.total, 0);
        const taxCollected = orders.reduce((sum, order) => sum + order.tax, 0);
        const averageOrder = orders.length ? revenue / orders.length : 0;
        const activeProducts = products.filter((product) => product.active).length;
        const lowStock = products.filter(
          (product) => product.stock <= settings.lowStockThreshold
        ).length;

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
  }
}
