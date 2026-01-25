import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../core/product.service';

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
          <div class="table-row" *ngFor="let product of productService.products$ | async">
            <span>{{ product.name }}</span>
            <span>{{ product.sku }}</span>
            <span>{{ product.price | currency }}</span>
            <span>{{ product.stock }}</span>
            <button
              class="btn btn-ghost"
              type="button"
              (click)="toggleActive(product.id, product.active)"
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

        <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
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

          <p class="form-error" *ngIf="errorMessage()">{{ errorMessage() }}</p>
          <button class="btn btn-primary" type="submit">Add product</button>
        </form>
      </div>
    </section>
  `
})
export class ProductsComponent {
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    sku: ['', [Validators.required, Validators.minLength(2)]],
    price: [0, [Validators.required, Validators.min(0)]],
    cost: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    taxRate: [0.08, [Validators.required, Validators.min(0)]]
  });

  readonly errorMessage = signal<string | null>(null);

  constructor(
    readonly productService: ProductService,
    private readonly formBuilder: FormBuilder
  ) {}

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      this.errorMessage.set(null);
      await this.productService.addProduct({
        name: this.form.value.name ?? '',
        sku: this.form.value.sku ?? '',
        price: this.form.value.price ?? 0,
        cost: this.form.value.cost ?? 0,
        stock: this.form.value.stock ?? 0,
        taxRate: this.form.value.taxRate ?? 0
      });
      this.form.reset({ price: 0, cost: 0, stock: 0, taxRate: 0.08 });
    } catch (error) {
      console.error(error);
      this.errorMessage.set('Unable to save product. Please try again.');
    }
  }

  async toggleActive(productId: string, isActive: boolean): Promise<void> {
    await this.productService.updateProduct(productId, { active: !isActive });
  }
}
