import { Component } from '@angular/core';
import { AuthCard } from '../auth-card/auth-card';
import { REGISTER_CONFIG } from '../auth.configs';

@Component({
  selector: 'app-register',
  imports: [AuthCard],
  template: `
    <app-auth-card [config]="registerConfig" (formSubmit)="onSubmit($event)" />
  `,
  styleUrl: './register.scss',
})
export class Register {
  registerConfig = REGISTER_CONFIG;

  onSubmit(value: Record<string, string>): void {
    // TODO: call auth service with value['email'] and value['password']
    console.log('Register submit', value);
  }
}
