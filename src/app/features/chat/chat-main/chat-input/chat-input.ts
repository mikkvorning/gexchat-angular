import { Component } from '@angular/core';
import { SnackbarService } from '@core/services/snackbar.service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-chat-input',
  imports: [MatButton],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.scss',
})
export class ChatInput {
  constructor(private readonly snackbar: SnackbarService) {}

  sendMessage() {
    this.snackbar.show('Message sent', 'info');
  }
}
