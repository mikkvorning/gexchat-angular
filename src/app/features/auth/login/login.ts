import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { getFieldError, matches, rule } from '@shared/utils/validators';

@Component({
  selector: 'app-login',
  imports: [
    MatCard,
    MatFormField,
    MatInput,
    MatButton,
    MatError,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatLabel,
    ReactiveFormsModule,
  ],
  template: `
    <mat-card
      class="login-card w-[400px] flex flex-col items-center gap-4 text-center"
    >
      <mat-card-header>
        <mat-card-title class="text-sys-primary"
          >Welcome to GexChat</mat-card-title
        >
        <mat-card-subtitle>
          Let's see if you still remember your login.
        </mat-card-subtitle>
      </mat-card-header>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <mat-card-content>
          <mat-form-field appearance="outline" class="w-full mb-6">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" />
            <mat-error>{{ getError('email') }}</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full mb-6">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" type="password" />
            <mat-error>{{ getError('password') }}</mat-error>
          </mat-form-field>
        </mat-card-content>
        <mat-card-actions>
          <div class="flex flex-col items-center gap-4 w-full mt-4">
            <button
              mat-flat-button
              type="submit"
              [disabled]="isLoading || loginForm.invalid"
              class="w-full"
            >
              Sign in
            </button>
            <button mat-stroked-button type="button" class="w-full">
              Continue as guest
            </button>
            <p class="signup-link">
              Don't have an account?
              <a mat-button color="primary" routerLink="/register"
                >Sign up here</a
              >
            </p>
          </div>
        </mat-card-actions>
      </form>
    </mat-card>
  `,
  styleUrls: ['./login.css'],
})
export class Login {
  private fb = inject(FormBuilder);
  isLoading = false;

  loginForm = this.fb.group({
    email: [
      '',
      [
        rule(Validators.required, 'Email is required'),
        rule(Validators.email, 'Please enter a valid email address'),
      ],
    ],
    password: [
      '',
      [
        rule(Validators.required, 'Password is required'),
        rule(Validators.minLength(8), 'Password must be at least 8 characters'),
        matches(/[A-Z]/, 'Password must contain at least one uppercase letter'),
        matches(/[a-z]/, 'Password must contain at least one lowercase letter'),
        matches(/[0-9]/, 'Password must contain at least one number'),
      ],
    ],
  });

  getError = (field: string) => getFieldError(this.loginForm, field);

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      // TODO: call auth service
    }
  }
}
