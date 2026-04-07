import { Component } from '@angular/core';
import { AuthCard } from '../auth-card/auth-card';
import { VERIFY_CONFIG } from '../auth.configs';

@Component({
  selector: 'app-verify',
  imports: [AuthCard],
  template: `
    <app-auth-card [config]="verifyConfig" (formSubmit)="onSubmit($event)" />
  `,
  styleUrl: './verify.scss',
})
export class Verify {
  verifyConfig = VERIFY_CONFIG;

  onSubmit(_value: Record<string, string>): void {
    // TODO: call auth service to resend verification email
    console.log('Resend verification email');
  }
}
