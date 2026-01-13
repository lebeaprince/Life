import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

type NavItem = {
  label: string;
  path: string;
  icon: string;
};

@Component({
  selector: 'app-master-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './master-layout.component.html',
  styleUrl: './master-layout.component.scss'
})
export class MasterLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly themeService = inject(ThemeService);

  readonly collapsed = signal(false);

  readonly theme = this.themeService.theme;
  readonly user = this.auth.user;
  readonly isLoggedIn = this.auth.isLoggedIn;

  readonly navItems = computed<NavItem[]>(() => {
    if (!this.isLoggedIn()) return [];
    return [
      { label: 'Home', path: '/home', icon: '⌂' },
      { label: 'Sale', path: '/pos', icon: '≡' },
	  { label: 'Product', path: '/product', icon: '◍' },
	  { label: 'Material', path: '/material', icon: '⌂' },
	  { label: 'Order', path: '/order', icon: '⌂' },
    ];
  });

  toggleCollapsed() {
    this.collapsed.set(!this.collapsed());
  }

  cycleTheme() {
    this.themeService.cycleTheme();
  }

  logout() {
    this.auth.logout();
  }

  cssVars() {
    const t = this.theme();
    return {
      '--bg': t.backgroundColor,
      '--surface': t.surfaceColor,
      '--text': t.textColor,
      '--muted': t.mutedTextColor,
      '--border': t.borderColor,
      '--accent': t.accentColor,
      '--accent2': t.accentColor2,
      '--bg-image': t.backgroundImageUrl ? `url(${t.backgroundImageUrl})` : 'none'
    } as Record<string, string>;
  }
}

