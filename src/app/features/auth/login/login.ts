import { AuthCard } from './../auth-card/auth-card';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [AuthCard],
  template: ` <app-auth-card></app-auth-card> `,
  styleUrls: ['./login.scss'],
})
export class Login {}
