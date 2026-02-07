import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of, shareReplay, startWith, Subject, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { CartItem, Order, PaymentType } from './models';

export interface OrderNotificationInput {
  customerName: string;
  phoneNumber: string;
}

export interface OrderInput {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentType: PaymentType;
  notification?: OrderNotificationInput;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly refresh$ = new Subject<void>();

  readonly orders$ = this.authService.profile$.pipe(
    switchMap((profile) => {
      if (!profile) {
        return of([] as Order[]);
      }
      return this.refresh$.pipe(
        startWith(undefined),
        switchMap(() => this.http.get<Order[]>(`${environment.apiBaseUrl}/orders`))
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  async createOrder(input: OrderInput): Promise<void> {
    await firstValueFrom(this.http.post(`${environment.apiBaseUrl}/orders`, input));
    this.refreshOrders();
  }

  async markReady(orderId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiBaseUrl}/orders/${orderId}/ready`, {})
    );
    this.refreshOrders();
  }

  refreshOrders(): void {
    this.refresh$.next();
  }
}
