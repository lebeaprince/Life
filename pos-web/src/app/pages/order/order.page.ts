import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../services/catalog.service';
import { SalesService } from '../../services/sales.service';
import type { CartItem, Product } from '../../types';

@Component({
  selector: 'app-order-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './order.page.html',
  styleUrl: './order.page.scss'
})
export class OrderPageComponent {
  private readonly catalog = inject(CatalogService);
  private readonly sales = inject(SalesService);

  protected readonly products = signal<Product[]>([]);
  protected readonly productsLoading = signal(false);
  protected readonly productsError = signal<string | null>(null);

  protected readonly cart = signal<CartItem[]>([]);
  protected readonly checkoutLoading = signal(false);
  protected readonly checkoutError = signal<string | null>(null);
  protected readonly lastReceiptId = signal<string | null>(null);

  protected readonly newProductName = signal('');
  protected readonly newProductPrice = signal<number | null>(null);
  protected readonly addingProduct = signal(false);
  protected readonly addProductError = signal<string | null>(null);

  protected readonly subtotal = computed(() =>
    this.cart().reduce((sum, line) => sum + line.qty * line.unitPrice, 0)
  );

  constructor() {
    void this.refreshProducts();
  }

  protected async refreshProducts() {
    this.productsLoading.set(true);
    this.productsError.set(null);
    try {
      this.products.set(await this.catalog.listProducts());
    } catch (e) {
      this.productsError.set(this.toMessage(e));
    } finally {
      this.productsLoading.set(false);
    }
  }

  protected addToCart(p: Product) {
    const existing = this.cart().find((x) => x.productId === p.id);
    if (existing) {
      this.setQty(p.id, existing.qty + 1);
      return;
    }
    this.cart.set([...this.cart(), { productId: p.id, name: p.name, unitPrice: p.price, qty: 1 }]);
  }

  protected setQty(productId: string, qty: number) {
    const nextQty = Math.max(0, Math.floor(qty));
    this.cart.set(
      this.cart()
        .map((line) => (line.productId === productId ? { ...line, qty: nextQty } : line))
        .filter((line) => line.qty > 0)
    );
  }

  protected removeFromCart(productId: string) {
    this.cart.set(this.cart().filter((line) => line.productId !== productId));
  }

  protected clearCart() {
    this.cart.set([]);
    this.lastReceiptId.set(null);
    this.checkoutError.set(null);
  }

  protected async checkout() {
    if (this.cart().length === 0) return;

    this.checkoutLoading.set(true);
    this.checkoutError.set(null);
    this.lastReceiptId.set(null);
    try {
      const receipt = await this.sales.checkout({ items: this.cart() });
      this.lastReceiptId.set(receipt.receiptId);
      this.cart.set([]);
    } catch (e) {
      this.checkoutError.set(this.toMessage(e));
    } finally {
      this.checkoutLoading.set(false);
    }
  }

  protected async createProduct() {
    const name = this.newProductName().trim();
    const price = this.newProductPrice();
    if (!name || price == null || !Number.isFinite(price) || price < 0) return;

    this.addingProduct.set(true);
    this.addProductError.set(null);
    try {
      await this.catalog.createProduct({ name, price });
      this.newProductName.set('');
      this.newProductPrice.set(null);
      await this.refreshProducts();
    } catch (e) {
      this.addProductError.set(this.toMessage(e));
    } finally {
      this.addingProduct.set(false);
    }
  }

  protected async deleteProduct(id: string) {
    if (!id) return;
    try {
      await this.catalog.deleteProduct(id);
      await this.refreshProducts();
    } catch (e) {
      this.productsError.set(this.toMessage(e));
    }
  }

  private toMessage(e: unknown) {
    if (e instanceof Error) return e.message;
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }
}

