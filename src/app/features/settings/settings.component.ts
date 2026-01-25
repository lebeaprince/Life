import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { TenantService } from '../../core/tenant.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
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
  `
})
export class SettingsComponent {
  constructor(
    readonly authService: AuthService,
    readonly tenantService: TenantService
  ) {}
}
