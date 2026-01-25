import { Injectable } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { OrderService } from './order.service';
import { ProductService } from './product.service';

@Injectable({ providedIn: 'root' })
export class MetricsService {
  readonly summary$ = this.createSummary();

  constructor(
    private readonly productService: ProductService,
    private readonly orderService: OrderService
  ) {}

  private createSummary() {
    return combineLatest([this.productService.products$, this.orderService.orders$]).pipe(
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
  }
}
