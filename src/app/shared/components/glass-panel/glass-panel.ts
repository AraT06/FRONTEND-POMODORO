import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-glass-panel',
  templateUrl: './glass-panel.html',
  styleUrl: './glass-panel.css'
})
export class GlassPanel {
  readonly title = input('');
  readonly action = input('');
  readonly menuOpen = signal(false);
  readonly compact = signal(false);
  readonly pinned = signal(false);
}
