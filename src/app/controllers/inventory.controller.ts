import { Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { InventoryService } from '../core/inventory.service';
import { ProductService } from '../core/product.service';

@Injectable({ providedIn: 'root' })
export class InventoryController {
  readonly errorMessage = signal<string | null>(null);
  readonly form = this.formBuilder.nonNullable.group({
    productId: ['', [Validators.required]],
    delta: [0, [Validators.required]],
    reason: ['', [Validators.required, Validators.minLength(2)]]
  });

  readonly products$ = this.productService.products$;
  readonly adjustments$ = this.inventoryService.adjustments$;

  constructor(
    private readonly productService: ProductService,
    private readonly inventoryService: InventoryService,
    private readonly formBuilder: FormBuilder
  ) {}

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      this.errorMessage.set(null);
      await this.productService.adjustStock(
        this.form.value.productId ?? '',
        Number(this.form.value.delta ?? 0),
        this.form.value.reason ?? ''
      );
      this.form.reset({ productId: '', delta: 0, reason: '' });
    } catch (error) {
      console.error(error);
      this.errorMessage.set('Unable to record inventory adjustment.');
    }
  }
}
