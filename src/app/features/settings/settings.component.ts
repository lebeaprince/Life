import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { SettingsService } from '../../core/settings.service';
import { TenantService } from '../../core/tenant.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-grid two-col">
      <div class="card">
        <div class="card-header">
          <div>
            <h4>Workspace settings</h4>
            <p class="muted">Manage your organization profile and plan.</p>
          </div>
        </div>
        <div class="card-body" *ngIf="tenantService.tenant$ | async as tenant">
          <div class="detail-row">
            <span>Name</span>
            <strong>{{ tenant.name }}</strong>
          </div>
          <div class="detail-row">
            <span>Plan</span>
            <strong>{{ tenant.plan | titlecase }}</strong>
          </div>
          <div class="detail-row">
            <span>Owner UID</span>
            <strong>{{ tenant.ownerUid }}</strong>
          </div>
          <div class="detail-row">
            <span>Workspace ID</span>
            <strong>{{ tenant.id }}</strong>
          </div>
          <button class="btn btn-outline">Upgrade plan</button>
        </div>
        <div class="card-body" *ngIf="!(tenantService.tenant$ | async)">
          <p class="muted">No tenant data found. Complete onboarding to continue.</p>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h4>User access</h4>
            <p class="muted">Invite teammates and set role-based access.</p>
          </div>
        </div>
        <div class="card-body" *ngIf="authService.profile$ | async as profile">
          <div class="detail-row">
            <span>Name</span>
            <strong>{{ profile.displayName }}</strong>
          </div>
          <div class="detail-row">
            <span>Email</span>
            <strong>{{ profile.email }}</strong>
          </div>
          <div class="detail-row">
            <span>Roles</span>
            <strong>{{ profile.roles.join(', ') }}</strong>
          </div>
          <button class="btn btn-outline">Invite teammate</button>
        </div>
      </div>
    </section>

    <section class="page-grid">
      <div class="card">
        <div class="card-header">
          <div>
            <h4>POS preferences</h4>
            <p class="muted">Default tax rate, currency, and low stock alerts.</p>
          </div>
        </div>
        <form [formGroup]="form" (ngSubmit)="save()" class="form-grid two-col">
          <label class="field">
            <span>Currency</span>
            <input type="text" formControlName="currency" placeholder="USD" />
          </label>
          <label class="field">
            <span>Default tax rate</span>
            <input type="number" step="0.01" formControlName="taxRate" />
          </label>
          <label class="field">
            <span>Low stock threshold</span>
            <input type="number" step="1" formControlName="lowStockThreshold" />
          </label>
          <div class="field">
            <button class="btn btn-primary" type="submit">Save settings</button>
          </div>
        </form>
      </div>
    </section>

    <section class="page-grid">
      <div class="card">
        <div class="card-header">
          <div>
            <h4>Loyalty & notifications</h4>
            <p class="muted">Configure points and ready notifications.</p>
          </div>
        </div>
        <form [formGroup]="form" (ngSubmit)="save()" class="form-grid two-col">
          <label class="field checkbox">
            <span>Loyalty program enabled</span>
            <input type="checkbox" formControlName="loyaltyEnabled" />
          </label>
          <label class="field checkbox">
            <span>Order ready notifications</span>
            <input type="checkbox" formControlName="orderReadyNotificationsEnabled" />
          </label>
          <label class="field">
            <span>Points per order</span>
            <input type="number" step="1" formControlName="loyaltyPointsPerOrder" />
          </label>
          <label class="field">
            <span>Points for a free order</span>
            <input type="number" step="1" formControlName="loyaltyRewardThreshold" />
          </label>
          <div class="field">
            <button class="btn btn-primary" type="submit">Save settings</button>
          </div>
        </form>
      </div>
    </section>
  `
})
export class SettingsComponent {
  readonly form;

  constructor(
    readonly authService: AuthService,
    readonly tenantService: TenantService,
    private readonly settingsService: SettingsService,
    private readonly formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.nonNullable.group({
      currency: ['', [Validators.required]],
      taxRate: [0, [Validators.required, Validators.min(0)]],
      lowStockThreshold: [5, [Validators.required, Validators.min(0)]],
      loyaltyEnabled: [true],
      orderReadyNotificationsEnabled: [true],
      loyaltyPointsPerOrder: [10, [Validators.required, Validators.min(0)]],
      loyaltyRewardThreshold: [100, [Validators.required, Validators.min(0)]]
    });

    this.settingsService.settings$.pipe(take(1)).subscribe((settings) => {
      this.form.patchValue(settings);
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    await this.settingsService.updateSettings(this.form.value);
  }
}
