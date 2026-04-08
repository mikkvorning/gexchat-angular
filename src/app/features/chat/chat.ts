import { Component, inject } from '@angular/core';
import {
  MatDrawerContainer,
  MatDrawer,
  MatDrawerContent,
} from '@angular/material/sidenav';
import { Sidebar } from './sidebar/sidebar';
import { ChatMain } from './chat-main/chat-main';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-chat',
  imports: [MatDrawerContainer, MatDrawer, Sidebar, MatDrawerContent, ChatMain],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat {
  readonly authStore = inject(AuthStore);
}
