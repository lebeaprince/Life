import { Injectable } from '@angular/core';
import type { CheckoutRequest, CheckoutResponse } from '../types';
import { asJson } from './http.util';

@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly baseUrl = '/api/sales';

  async checkout(input: CheckoutRequest): Promise<CheckoutResponse> {
    return await asJson<CheckoutResponse>(
      await fetch(`${this.baseUrl}/checkout`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input)
      })
    );
  }
}

