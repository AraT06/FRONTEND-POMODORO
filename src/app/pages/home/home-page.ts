import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatCard as StatCardModel } from '../../core/models/dashboard.models';
import { AppStateService } from '../../core/services/app-state.service';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { GlassPanel } from '../../shared/components/glass-panel/glass-panel';
import { AmbientScene } from '../../features/ambient-scene/ambient-scene';
import { ProgressTree } from '../../features/progress-tree/progress-tree';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, StatCard, GlassPanel, AmbientScene, ProgressTree],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {
  readonly state = inject(AppStateService);
  readonly stats = computed<StatCardModel[]>(() => {
    const weather = this.state.activeWeather();
    return [
      { label: 'Minutos de enfoque', value: `${this.state.focusMinutes()}`, delta: `+${this.state.focusSessions()} sesiones`, icon: '◷', tone: 'lime' },
      { label: 'Ambiente activo', value: weather.label, delta: weather.city, icon: '☁', tone: 'mint' },
      { label: 'Temperatura', value: `${weather.temperature}°C`, delta: `${weather.humidity}% humedad`, icon: '☼', tone: 'rose' },
      { label: 'Viento', value: `${weather.wind}`, delta: 'km/h', icon: '≈', tone: 'lavender' }
    ];
  });
}
