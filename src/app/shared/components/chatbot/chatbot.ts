import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';

interface ChatMessage {
  author: 'bot' | 'user';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  imports: [FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css'
})
export class Chatbot {
  private readonly chatService = inject(ChatService);
  readonly open = signal(false);
  readonly sending = signal(false);
  readonly draft = signal('');
  readonly messages = signal<ChatMessage[]>([
    { author: 'bot', text: 'Hola, soy Focus. ¿Quieres una recomendación para tu próxima sesión?' }
  ]);

  toggle() {
    this.open.update((value) => !value);
  }

  async send() {
    const message = this.draft().trim();
    if (!message || this.sending()) return;

    this.messages.update((items) => [...items, { author: 'user', text: message }]);
    this.draft.set('');
    this.sending.set(true);
    const reply = await this.chatService.ask(message);
    this.messages.update((items) => [...items, { author: 'bot', text: reply }]);
    this.sending.set(false);
  }
}
