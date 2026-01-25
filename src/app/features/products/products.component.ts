import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductsController } from '../../controllers/products.controller';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <section class="page-grid two-col">
      <div class="card">
        <div class="card-header">
          <div>
            <h4>Product catalog</h4>
            <p class="muted">Create and manage items sold at the register.</p>
          </div>
        </div>

        <div class="table">
          <div class="table-row header">
            <span>Name</span>
            <span>SKU</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Status</span>
          </div>
          <div class="table-row" *ngFor="let product of controller.products$ | async">
            <span>{{ product.name }}</span>
            <span>{{ product.sku }}</span>
            <span>{{ product.price | currency }}</span>
            <span>{{ product.stock }}</span>
            <button
              class="btn btn-ghost"
              type="button"
              (click)="controller.toggleActive(product.id, product.active)"
            >
              {{ product.active ? 'Active' : 'Inactive' }}
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h4>Add product</h4>
            <p class="muted">Add SKUs with pricing, taxes, and stock levels.</p>
          </div>
        </div>

        <form [formGroup]="controller.form" (ngSubmit)="controller.submit()" class="form-grid">
          <label class="field">
            <span>Name</span>
            <input type="text" formControlName="name" placeholder="Espresso Blend" />
          </label>

          <label class="field">
            <span>SKU</span>
            <input type="text" formControlName="sku" placeholder="ESP-001" />
          </label>

          <label class="field">
            <span>Price</span>
            <input type="number" formControlName="price" min="0" step="0.01" />
          </label>

          <label class="field">
            <span>Cost</span>
            <input type="number" formControlName="cost" min="0" step="0.01" />
          </label>

          <label class="field">
            <span>Stock</span>
            <input type="number" formControlName="stock" min="0" step="1" />
          </label>

          <label class="field">
            <span>Tax rate</span>
            <input type="number" formControlName="taxRate" min="0" max="1" step="0.01" />
          </label>

          <p class="form-error" *ngIf="controller.errorMessage()">
            {{ controller.errorMessage() }}
          </p>
          <button class="btn btn-primary" type="submit">Add product</button>
        </form>
      </div>
    </section>
  `
})
export class ProductsComponent {
  constructor(readonly controller: ProductsController) {}
}
