import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UsersController } from '../../controllers/users.controller';
import { RoleService } from '../../core/role.service';
import { UserProfile, UserRole } from '../../core/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-grid">
      <div class="card">
        <div class="card-header">
          <div>
            <h4>Users and roles</h4>
            <p class="muted">Manage access for your workspace.</p>
          </div>
          <span class="badge badge-outline">Team</span>
        </div>

        <div class="table">
          <div class="table-row header">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Actions</span>
          </div>
          <div class="table-row" *ngFor="let user of controller.users$ | async">
            <span>{{ user.displayName }}</span>
            <span>{{ user.email }}</span>
            <div>
              <select
                class="input"
                [value]="primaryRole(user)"
                [disabled]="!(roleService.canManageUsers$ | async)"
                (change)="onRoleChange(user, $any($event.target).value)"
              >
                <option *ngFor="let role of controller.roles" [value]="role">
                  {{ role }}
                </option>
              </select>
            </div>
            <span class="muted">{{ user.roles.join(', ') }}</span>
          </div>
        </div>

        <p class="form-error" *ngIf="controller.errorMessage()">
          {{ controller.errorMessage() }}
        </p>
        <p class="muted" *ngIf="!(roleService.canManageUsers$ | async)">
          You need owner or manager access to update roles.
        </p>
      </div>
    </section>
  `
})
export class UsersComponent {
  constructor(
    readonly controller: UsersController,
    readonly roleService: RoleService
  ) {}

  primaryRole(user: UserProfile): UserRole {
    return user.roles[0] ?? 'cashier';
  }

  onRoleChange(user: UserProfile, role: UserRole): void {
    this.controller.updateRoles(user.uid, [role]);
  }
}
