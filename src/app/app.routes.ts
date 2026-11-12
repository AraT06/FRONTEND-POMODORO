import { Routes } from '@angular/router';
import { AppShell } from './layout/app-shell/app-shell';
import { HomePage } from './pages/home/home-page';
import { AmbiencePage } from './pages/ambience/ambience-page';
import { PomodoroPage } from './pages/pomodoro/pomodoro-page';
import { ProgressPage } from './pages/progress/progress-page';
import { AudioPage } from './pages/audio/audio-page';
import { SettingsPage } from './pages/settings/settings-page';

export const routes: Routes = [
  {
    path: '',
    component: AppShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: 'inicio', component: HomePage, title: 'POMODORO | Inicio' },
      { path: 'ambiente', component: AmbiencePage, title: 'POMODORO | Ambiente' },
      { path: 'pomodoro', component: PomodoroPage, title: 'POMODORO | Pomodoro' },
      { path: 'progreso', component: ProgressPage, title: 'POMODORO | Progreso' },
      { path: 'audio', component: AudioPage, title: 'POMODORO | Audio' },
      { path: 'ajustes', component: SettingsPage, title: 'POMODORO | Ajustes' }
    ]
  },
  { path: '**', redirectTo: 'inicio' }
];
