import { Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../core/product.service';

@Injectable({ providedIn: 'root' })
export class ProductsController {
  readonly errorMessage = signal<string | null>(null);
  readonly form = signal<any>(null);
  readonly products$ = signal<any>(null);

  constructor(
    private readonly productService: ProductService,
    private readonly formBuilder: FormBuilder
  ) {
    this.products$.set(this.productService.products$);
    this.form.set(this.formBuilder.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      sku: ['', [Validators.required, Validators.minLength(2)]],
      price: [0, [Validators.required, Validators.min(0)]],
      cost: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      taxRate: [0.08, [Validators.required, Validators.min(0)]]
    }));
  }

  async submit(): Promise<void> {
    if (this.form().invalid) {
      this.form().markAllAsTouched();
      return;
    }

    try {
      this.errorMessage.set(null);
      await this.productService.addProduct({
        name: this.form().value.name ?? '',
        sku: this.form().value.sku ?? '',
        price: this.form().value.price ?? 0,
        cost: this.form().value.cost ?? 0,
        stock: this.form().value.stock ?? 0,
        taxRate: this.form().value.taxRate ?? 0
      });
      this.form().reset({ price: 0, cost: 0, stock: 0, taxRate: 0.08 });
    } catch (error) {
      console.error(error);
      this.errorMessage.set('Unable to save product. Please try again.');
    }
  }

  async toggleActive(productId: string, isActive: boolean): Promise<void> {
    await this.productService.updateProduct(productId, { active: !isActive });
  }
}
