import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card wide">
        <div class="auth-header">
          <p class="auth-eyebrow">Nimbus POS</p>
          <h1>Create your workspace</h1>
          <p class="auth-subtitle">Set up your store and start taking orders in minutes.</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid two-col">
          <label class="field">
            <span>Full name</span>
            <input type="text" formControlName="displayName" placeholder="Alex Rivera" />
          </label>

          <label class="field">
            <span>Business name</span>
            <input type="text" formControlName="tenantName" placeholder="Nimbus Coffee Roasters" />
          </label>

          <label class="field">
            <span>Work email</span>
            <input type="email" formControlName="email" placeholder="you@company.com" />
          </label>

          <label class="field">
            <span>Password</span>
            <input type="password" formControlName="password" placeholder="password" />
          </label>

          <label class="field">
            <span>Confirm password</span>
            <input type="password" formControlName="confirmPassword" placeholder="password" />
          </label>

          <div class="field span-2">
            <p class="form-error" *ngIf="errorMessage()">{{ errorMessage() }}</p>
            <button class="btn btn-primary" type="submit" [disabled]="isSubmitting()">
              {{ isSubmitting() ? 'Creating account...' : 'Create workspace' }}
            </button>
          </div>
        </form>

        <p class="auth-footer">
          Already have an account?
          <a routerLink="/login">Sign in</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  readonly form: FormGroup;
  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.form = this.formBuilder.nonNullable.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      tenantName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  async submit(): Promise<void> {
    const form = this.form;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    if (form.value.password !== form.value.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.signUp({
        displayName: form.value.displayName ?? '',
        tenantName: form.value.tenantName ?? '',
        email: form.value.email ?? '',
        password: form.value.password ?? ''
      });
      await this.router.navigate(['/app']);
    } catch (error) {
      console.error(error);
      this.errorMessage.set('We could not create your account. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
