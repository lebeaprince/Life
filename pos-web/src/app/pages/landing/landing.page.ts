import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss'
})
export class LandingPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  readonly email = signal('');
  readonly password = signal('');
  readonly error = signal<string | null>(null);
  readonly loggingIn = signal(false);

  readonly themes = this.themeService.allThemes;
  readonly theme = this.themeService.theme;

  async login() {
    this.error.set(null);
    this.loggingIn.set(true);
    try {
      const res = this.auth.login({ email: this.email(), password: this.password() });
      if (!res.ok) {
        this.error.set(res.message);
        return;
      }

      // Apply client theme based on session clientId.
      const clientId = this.auth.user()?.clientId ?? 'default';
      this.themeService.setThemeByClientId(clientId);
      await this.router.navigateByUrl('/home');
    } finally {
      this.loggingIn.set(false);
    }
  }

  pickTheme(clientId: string) {
    this.themeService.setThemeByClientId(clientId);
  }
}

