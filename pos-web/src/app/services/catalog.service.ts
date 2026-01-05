import { Injectable } from '@angular/core';
import type { Product } from '../types';
import { asJson } from './http.util';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly baseUrl = '/api/catalog';

  async listProducts(): Promise<Product[]> {
    return await asJson<Product[]>(await fetch(`${this.baseUrl}/products`));
  }

  async createProduct(input: { name: string; price: number }): Promise<{ id: string }> {
    return await asJson<{ id: string }>(
      await fetch(`${this.baseUrl}/products`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input)
      })
    );
  }

  async deleteProduct(id: string): Promise<void> {
    await asJson<void>(
      await fetch(`${this.baseUrl}/products/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      })
    );
  }
}

