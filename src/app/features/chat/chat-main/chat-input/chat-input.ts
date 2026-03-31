import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { SnackbarService } from '@core/services/snackbar.service';

@Component({
  selector: 'app-chat-input',
  imports: [
    FormsModule,
    MatIconButton,
    MatIconButton,
    MatFormField,
    MatSuffix,
    MatInput,
    MatIcon,
  ],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.scss',
})
export class ChatInput {
  constructor(private readonly snackbar: SnackbarService) {}
  messageValue = '';

  sendMessage() {
    this.snackbar.show('Message sent', 'info');
  }
}
