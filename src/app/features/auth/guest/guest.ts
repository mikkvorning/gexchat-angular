import { Component, inject } from '@angular/core';
import { AuthCard } from '../auth-card/auth-card';
import { GUEST_CONFIG } from '../auth.configs';
import { AuthStore } from '../../../store/auth.store';

@Component({
  selector: 'app-guest',
  imports: [AuthCard],
  template: `
    <app-auth-card
      [config]="guestConfig"
      [isLoading]="authStore.isLoading()"
      (formSubmit)="onSubmit($event)"
    />
  `,
  styleUrl: './guest.scss',
})
export class Guest {
  readonly authStore = inject(AuthStore);
  readonly guestConfig = GUEST_CONFIG;

  onSubmit(value: Record<string, string>): void {
    this.authStore.loginAsGuest(value['username']);
  }
}
