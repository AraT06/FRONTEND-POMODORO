import { Component, inject } from '@angular/core';
import { AppStateService } from '../../core/services/app-state.service';
import { GlassPanel } from '../../shared/components/glass-panel/glass-panel';
import { PomodoroTimer } from '../../features/pomodoro/pomodoro-timer/pomodoro-timer';
import { ProgressTree } from '../../features/progress-tree/progress-tree';

@Component({
  selector: 'app-pomodoro-page',
  imports: [GlassPanel, PomodoroTimer, ProgressTree],
  templateUrl: './pomodoro-page.html',
  styleUrl: './pomodoro-page.css'
})
export class PomodoroPage {
  readonly state = inject(AppStateService);
}
