import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <p class="auth-eyebrow">Nimbus POS</p>
          <h1>Welcome back</h1>
          <p class="auth-subtitle">Sign in to manage sales, inventory, and orders.</p>
        </div>

        <form [formGroup]="form()" (ngSubmit)="submit()" class="form-grid">
          <label class="field">
            <span>Email</span>
            <input type="email" formControlName="email" placeholder="you@company.com" />
          </label>

          <label class="field">
            <span>Password</span>
            <input type="password" formControlName="password" placeholder="password" />
          </label>

          <p class="form-error" *ngIf="errorMessage()">{{ errorMessage() }}</p>

          <button class="btn btn-primary" type="submit" [disabled]="isSubmitting()">
            {{ isSubmitting() ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <p class="auth-footer">
          New to Nimbus?
          <a routerLink="/register">Create an account</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  readonly form = signal<any>(null);

  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.form.set(this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    }));
  }

  async submit(): Promise<void> {
    const form = this.form();
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.signIn(form.value.email ?? '', form.value.password ?? '');
      await this.router.navigate(['/app']);
    } catch (error) {
      console.error(error);
      this.errorMessage.set('Sign in failed. Please check your credentials.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
