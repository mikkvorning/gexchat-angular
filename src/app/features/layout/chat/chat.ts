import { Component } from '@angular/core';
import { ChatInput } from './components/chat-input/chat-input';
import { ChatMessages } from './components/chat-messages/chat-messages';

@Component({
  selector: 'app-chat',
  imports: [ChatMessages, ChatInput],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
  host: { class: 'flex-1 min-w-0' },
})
export class Chat {}
