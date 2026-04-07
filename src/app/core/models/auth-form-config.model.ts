import { ValidatorFn } from '@angular/forms';

export interface AuthFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password';
  validators: ValidatorFn[];
}

export interface AuthCardConfig {
  title: string;
  subtitle: string;
  submitLabel: string;
  fields: AuthFieldConfig[];
  secondaryButton?: {
    label: string;
    routerLink: string;
  };
  footerLink?: {
    prefixText: string;
    linkText: string;
    routerLink: string;
  };
}
