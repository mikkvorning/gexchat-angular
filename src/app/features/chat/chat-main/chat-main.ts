import { Component } from '@angular/core';
import { ChatInput } from './chat-input/chat-input';
import { ChatMessages } from './chat-messages/chat-messages';

@Component({
  selector: 'app-chat',
  imports: [ChatMessages, ChatInput],
  templateUrl: './chat-main.html',
  styleUrl: './chat-main.scss',
  host: { class: 'flex-1 min-w-0' },
})
export class Chat {}
