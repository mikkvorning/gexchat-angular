import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
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
import { AuthCardConfig } from '@core/models/auth-form-config.model';
import { getFieldError } from '@shared/utils/validators';

@Component({
  selector: 'app-auth-card',
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
    RouterLink,
  ],
  template: `
    <mat-card
      class="auth-card w-100 flex flex-col items-center gap-4 text-center"
    >
      <mat-card-header>
        <mat-card-title class="text-sys-primary py-2 font-bold!">
          {{ config().title }}
        </mat-card-title>
        <mat-card-subtitle>
          {{ config().subtitle }}
        </mat-card-subtitle>
      </mat-card-header>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="w-full">
        <mat-card-content class="w-full">
          @for (field of config().fields; track field.name) {
            <mat-form-field appearance="outline" class="w-full mb-6">
              <mat-label>{{ field.label }}</mat-label>
              <input
                matInput
                [formControlName]="field.name"
                [type]="field.type"
              />
              <mat-error>{{ getError(field.name) }}</mat-error>
            </mat-form-field>
          }
        </mat-card-content>
        <mat-card-actions>
          <div class="flex flex-col items-center gap-4 w-full mt-4">
            <button
              mat-flat-button
              type="submit"
              [disabled]="isLoading() || (form.invalid && form.touched)"
              class="w-full"
            >
              {{ config().submitLabel }}
            </button>
            @if (config().secondaryButton; as secondary) {
              <button
                mat-stroked-button
                type="button"
                [routerLink]="secondary.routerLink"
                class="w-full"
              >
                {{ secondary.label }}
              </button>
            }
            @if (config().footerLink; as footer) {
              <p>
                {{ footer.prefixText }}
                <a
                  [routerLink]="footer.routerLink"
                  class="underline text-sys-primary"
                >
                  {{ footer.linkText }}
                </a>
              </p>
            }
          </div>
        </mat-card-actions>
      </form>
    </mat-card>
  `,
  styleUrls: ['./auth-card.scss'],
})
export class AuthCard implements OnInit {
  private fb = inject(FormBuilder);

  config = input.required<AuthCardConfig>();
  isLoading = input<boolean>(false);
  formSubmit = output<Record<string, string>>();

  form!: FormGroup;

  ngOnInit(): void {
    const controls: Record<string, [string, ReturnType<typeof Array>]> = {};
    for (const field of this.config().fields) {
      controls[field.name] = ['', field.validators];
    }
    this.form = this.fb.group(controls);
  }

  getError = (field: string) => getFieldError(this.form, field);

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value as Record<string, string>);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
