import { Component } from '@angular/core';
import { generateAvatarColor, shouldUseWhiteText } from '@shared/utils/colors';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  // prettier-ignore
  contacts = [
    { name: 'Alice', lastMessage: 'Hey, how are you?' },
    { name: 'Bob', lastMessage: 'Are we still on for tomorrow?' },
    { name: 'Carol', lastMessage: "Don't forget to send the report." },
    { name: 'David', lastMessage: 'See you at the meeting.' },
    { name: 'Eve', lastMessage: 'Can you review the document?' },
    /* eslint-disable max-len */
  ].map((contact) => ({
    ...contact,
    avatar: {
      color: generateAvatarColor(contact.name),
      textColor: shouldUseWhiteText(generateAvatarColor(contact.name))
        ? getComputedStyle(document.documentElement).getPropertyValue('--mat-sys-surface')
        : getComputedStyle(document.documentElement).getPropertyValue('--mat-sys-on-surface'),
    },
  }));
  /* eslint-enable max-len */
}
