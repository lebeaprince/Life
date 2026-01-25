import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CartItem, Product } from './models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>([]);
  readonly items$ = this.itemsSubject.asObservable();

  readonly subtotal$ = this.items$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0))
  );

  readonly tax$ = this.items$.pipe(
    map((items) =>
      items.reduce((sum, item) => sum + item.price * item.quantity * item.taxRate, 0)
    )
  );

  readonly total$ = this.items$.pipe(
    map((items) =>
      items.reduce(
        (sum, item) => sum + item.price * item.quantity * (1 + item.taxRate),
        0
      )
    )
  );

  addItem(product: Product): void {
    const items = [...this.itemsSubject.value];
    const existing = items.find((item) => item.productId === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        taxRate: product.taxRate,
        quantity: 1
      });
    }

    this.itemsSubject.next(items);
  }

  updateQuantity(productId: string, quantity: number): void {
    const items = this.itemsSubject.value
      .map((item) =>
        item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
      .filter((item) => item.quantity > 0);
    this.itemsSubject.next(items);
  }

  removeItem(productId: string): void {
    const items = this.itemsSubject.value.filter((item) => item.productId !== productId);
    this.itemsSubject.next(items);
  }

  clear(): void {
    this.itemsSubject.next([]);
  }
}
