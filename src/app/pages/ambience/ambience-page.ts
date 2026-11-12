import { Component, inject } from '@angular/core';
import { AppStateService } from '../../core/services/app-state.service';
import { WeatherCategory } from '../../core/models/dashboard.models';
import { GlassPanel } from '../../shared/components/glass-panel/glass-panel';
import { AmbientScene } from '../../features/ambient-scene/ambient-scene';
import { WeatherPanel } from '../../features/weather-panel/weather-panel';

@Component({
  selector: 'app-ambience-page',
  imports: [GlassPanel, AmbientScene, WeatherPanel],
  templateUrl: './ambience-page.html',
  styleUrl: './ambience-page.css'
})
export class AmbiencePage {
  readonly state = inject(AppStateService);

  setWeather(id: WeatherCategory) {
    this.state.setWeather(id);
  }
}
