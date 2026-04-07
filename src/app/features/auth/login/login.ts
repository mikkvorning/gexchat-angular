import { Component } from '@angular/core';
import { AuthCard } from '../auth-card/auth-card';
import { LOGIN_CONFIG } from '../auth.configs';

@Component({
  selector: 'app-login',
  imports: [AuthCard],
  template: `
    <app-auth-card [config]="loginConfig" (formSubmit)="onSubmit($event)" />
  `,
  styleUrls: ['./login.scss'],
})
export class Login {
  loginConfig = LOGIN_CONFIG;

  onSubmit(value: Record<string, string>): void {
    // TODO: call auth service with value['email'] and value['password']
    console.log('Login submit', value);
  }
}
