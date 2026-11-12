import { Component, inject } from '@angular/core';
import { AppStateService } from '../../core/services/app-state.service';
import { GlassPanel } from '../../shared/components/glass-panel/glass-panel';
import { AudioPanel } from '../../features/audio-panel/audio-panel';

@Component({
  selector: 'app-audio-page',
  imports: [GlassPanel, AudioPanel],
  templateUrl: './audio-page.html',
  styleUrl: './audio-page.css'
})
export class AudioPage {
  readonly state = inject(AppStateService);
}
