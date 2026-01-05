import { Routes } from '@angular/router';
import { MasterLayoutComponent } from './layout/master-layout.component';
import { HomePageComponent } from './pages/home/home.page';
import { LandingPageComponent } from './pages/landing/landing.page';
import { PosPageComponent } from './pages/pos/pos.page';
import { redirectIfAuthedGuard, requireAuthGuard } from './guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    component: MasterLayoutComponent,
    children: [
      { path: '', component: LandingPageComponent, canActivate: [redirectIfAuthedGuard] },
      { path: 'home', component: HomePageComponent, canActivate: [requireAuthGuard] },
      { path: 'pos', component: PosPageComponent, canActivate: [requireAuthGuard] }
    ]
  },
  { path: '**', redirectTo: '' }
];
