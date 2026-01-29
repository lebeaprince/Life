import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of, shareReplay, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Product } from './models';

export interface ProductInput {
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  taxRate: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  readonly products$ = this.authService.profile$.pipe(
    switchMap((profile) => {
      if (!profile) {
        return of([] as Product[]);
      }
      return this.http.get<Product[]>(`${environment.apiBaseUrl}/products`);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  async addProduct(input: ProductInput): Promise<void> {
    await firstValueFrom(this.http.post(`${environment.apiBaseUrl}/products`, input));
  }

  async updateProduct(productId: string, changes: Partial<Product>): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${environment.apiBaseUrl}/products/${productId}`, changes)
    );
  }

  async adjustStock(productId: string, delta: number, reason: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiBaseUrl}/products/${productId}/adjust-stock`, {
        delta,
        reason
      })
    );
  }
}
