import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InventoryController } from '../../controllers/inventory.controller';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-grid two-col">
      <div class="card">
        <div class="card-header">
          <div>
            <h4>Inventory levels</h4>
            <p class="muted">Track on-hand quantities across your catalog.</p>
          </div>
        </div>

        <div class="table">
          <div class="table-row header">
            <span>Product</span>
            <span>SKU</span>
            <span>Stock</span>
            <span>Status</span>
          </div>
          <div class="table-row" *ngFor="let product of controller.products$ | async">
            <span>{{ product.name }}</span>
            <span>{{ product.sku }}</span>
            <span>{{ product.stock }}</span>
            <span class="badge" [class.badge-warn]="product.stock <= 5">
              {{ product.stock <= 5 ? 'Low' : 'Healthy' }}
            </span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h4>Adjust stock</h4>
            <p class="muted">Log quick counts, corrections, and restocks.</p>
          </div>
        </div>

        <form [formGroup]="controller.form" (ngSubmit)="controller.submit()" class="form-grid">
          <label class="field">
            <span>Product</span>
            <select formControlName="productId" class="input">
              <option value="">Select a product</option>
              <option *ngFor="let product of controller.products$ | async" [value]="product.id">
                {{ product.name }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>Quantity change</span>
            <input type="number" formControlName="delta" class="input" />
          </label>

          <label class="field">
            <span>Reason</span>
            <input type="text" formControlName="reason" placeholder="Restock delivery" />
          </label>

          <p class="form-error" *ngIf="controller.errorMessage()">
            {{ controller.errorMessage() }}
          </p>
          <button class="btn btn-primary" type="submit">Log adjustment</button>
        </form>
      </div>
    </section>

    <section class="page-grid">
      <div class="card">
        <div class="card-header">
          <div>
            <h4>Recent adjustments</h4>
            <p class="muted">Audit stock changes for the last 30 days.</p>
          </div>
        </div>

        <div class="table">
          <div class="table-row header">
            <span>Product ID</span>
            <span>Delta</span>
            <span>Reason</span>
          </div>
          <div class="table-row" *ngFor="let item of controller.adjustments$ | async">
            <span>{{ item.productId }}</span>
            <span>{{ item.delta }}</span>
            <span>{{ item.reason }}</span>
          </div>
        </div>
      </div>
    </section>
  `
})
export class InventoryComponent {
  constructor(readonly controller: InventoryController) {}
}
