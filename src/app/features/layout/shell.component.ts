import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { TenantService } from '../../core/tenant.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">NP</div>
          <div>
            <div class="brand-title">Nimbus POS</div>
            <div class="brand-subtitle" *ngIf="tenantService.tenant$ | async as tenant">
              {{ tenant.name }}
            </div>
          </div>
        </div>

        <nav class="nav">
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.path"
            routerLinkActive="active"
            class="nav-link"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-meta" *ngIf="authService.profile$ | async as profile">
            <div class="avatar">{{ profile.displayName[0] }}</div>
            <div>
              <div class="user-name">{{ profile.displayName }}</div>
              <div class="user-email">{{ profile.email }}</div>
            </div>
          </div>
          <button class="btn btn-ghost" (click)="signOut()">Sign out</button>
        </div>
      </aside>

      <div class="content-shell">
        <header class="topbar">
          <div>
            <p class="eyebrow">Workspace overview</p>
            <h2>Today at a glance</h2>
          </div>
          <div class="topbar-actions">
            <a class="btn btn-outline" routerLink="/app/pos">New order</a>
            <a class="btn btn-primary" routerLink="/app/products">Add product</a>
          </div>
        </header>

        <main class="page">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class ShellComponent {
  readonly navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: 'DB' },
    { label: 'Sale', path: '/app/pos', icon: 'SAL' },
    { label: 'Products', path: '/app/products', icon: 'PR' },
    { label: 'Inventory', path: '/app/inventory', icon: 'INV' },
    { label: 'Orders', path: '/app/orders', icon: 'ORD' },
    { label: 'Users', path: '/app/users', icon: 'USR' },
    { label: 'Settings', path: '/app/settings', icon: 'SET' }
  ];

  constructor(
    readonly authService: AuthService,
    readonly tenantService: TenantService,
    private readonly router: Router
  ) {}

  async signOut(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigate(['/login']);
  }
}
