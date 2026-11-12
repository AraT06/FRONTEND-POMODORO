import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppStateService } from '../../core/services/app-state.service';
import { Chatbot } from '../../shared/components/chatbot/chatbot';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Chatbot],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css'
})
export class AppShell {
  readonly state = inject(AppStateService);
  readonly navItems = [
    { label: 'Inicio', path: '/inicio', icon: 'I' },
    { label: 'Ambiente', path: '/ambiente', icon: 'A' },
    { label: 'Pomodoro', path: '/pomodoro', icon: 'P' },
    { label: 'Progreso', path: '/progreso', icon: 'G' },
    { label: 'Audio', path: '/audio', icon: 'S' },
    { label: 'Ajustes', path: '/ajustes', icon: 'C' }
  ];
  readonly search = signal('');
  readonly filteredNav = computed(() => {
    const term = this.search().trim().toLowerCase();
    return term ? this.navItems.filter((item) => item.label.toLowerCase().includes(term)) : this.navItems;
  });

  toggleMute() {
    this.state.setMuted(!this.state.muted());
  }
}
