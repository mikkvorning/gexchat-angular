import { Component } from '@angular/core';
import { AuthCard } from '../auth-card/auth-card';
import { GUEST_CONFIG } from '../auth.configs';

@Component({
  selector: 'app-guest',
  imports: [AuthCard],
  template: `
    <app-auth-card [config]="guestConfig" (formSubmit)="onSubmit($event)" />
  `,
  styleUrl: './guest.scss',
})
export class Guest {
  guestConfig = GUEST_CONFIG;

  onSubmit(value: Record<string, string>): void {
    // TODO: call auth service with value['username']
    console.log('Guest submit', value);
  }
}
