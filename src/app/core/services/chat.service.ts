import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppStateService } from './app-state.service';

interface ChatResponse {
  reply: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly state = inject(AppStateService);

  async ask(message: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.post<ChatResponse>('http://localhost:3000/api/chat', {
          message,
          context: {
            sessions: this.state.focusSessions(),
            minutes: this.state.focusMinutes()
          }
        })
      );
      return response.reply;
    } catch {
      return this.localReply(message);
    }
  }

  private localReply(message: string): string {
    const text = message.toLowerCase();
    if (text.includes('descanso')) {
      return 'Toma 5 minutos después de cada bloque de 25 minutos. Después de cuatro bloques, haz una pausa larga.';
    }
    if (text.includes('progreso')) {
      return `Llevas ${this.state.focusSessions()} sesiones y ${this.state.focusMinutes()} minutos de enfoque.`;
    }
    return 'Divide tu tarea en un bloque de 25 minutos, elimina distracciones y empieza por el siguiente paso concreto.';
  }
}
