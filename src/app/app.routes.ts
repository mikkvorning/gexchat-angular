import { Routes } from '@angular/router';
import { Login } from '@features/auth/login/login';
import { Register } from '@features/auth/register/register';
import { Verify } from '@features/auth/verify/verify';
import { Guest } from '@features/auth/guest/guest';
import { Chat } from '@features/chat/chat';

export const routes: Routes = [
  {
    path: 'register',
    component: Register,
  },
  {
    path: 'signup',
    redirectTo: 'register',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'signin',
    redirectTo: 'login',
  },
  {
    path: 'verify',
    component: Verify,
  },
  {
    path: 'guest',
    component: Guest,
  },
  {
    path: '',
    component: Chat,
  },
  {
    path: '**',
    component: Chat,
  },
];
