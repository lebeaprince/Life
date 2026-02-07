import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, of, shareReplay, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { CartItem, Order, PaymentType } from './models';

export interface OrderInput {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentType: PaymentType;
  notifyWhenReady?: boolean;
  customerName?: string;
  customerPhone?: string;
  redeemReward?: boolean;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly refreshSubject = new BehaviorSubject<void>(undefined);

  readonly orders$ = this.authService.profile$.pipe(
    switchMap((profile) => {
      if (!profile) {
        return of([] as Order[]);
      }
      return this.refreshSubject.pipe(
        switchMap(() => this.http.get<Order[]>(`${environment.apiBaseUrl}/orders`))
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  async createOrder(input: OrderInput): Promise<void> {
    await firstValueFrom(this.http.post(`${environment.apiBaseUrl}/orders`, input));
    this.refreshSubject.next();
  }

  async markOrderReady(orderId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiBaseUrl}/orders/${orderId}/ready`, {})
    );
    this.refreshSubject.next();
  }
}
