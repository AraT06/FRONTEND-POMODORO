import { Component, inject } from '@angular/core';
import { AppStateService } from '../../core/services/app-state.service';
import { GlassPanel } from '../../shared/components/glass-panel/glass-panel';
import { ProgressTree } from '../../features/progress-tree/progress-tree';

@Component({
  selector: 'app-progress-page',
  imports: [GlassPanel, ProgressTree],
  templateUrl: './progress-page.html',
  styleUrl: './progress-page.css'
})
export class ProgressPage {
  readonly state = inject(AppStateService);
}
