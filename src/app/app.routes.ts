import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { ShellComponent } from './features/layout/shell.component';
import { OrdersComponent } from './features/orders/orders.component';
import { PosComponent } from './features/pos/pos.component';
import { ProductsComponent } from './features/products/products.component';
import { SettingsComponent } from './features/settings/settings.component';
import { UsersComponent } from './features/users/users.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'app' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'app',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'pos', component: PosComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'users', component: UsersComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: 'app' }
];
