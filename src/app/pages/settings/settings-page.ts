import { Component, inject } from '@angular/core';
import { AppStateService } from '../../core/services/app-state.service';
import { WeatherCategory } from '../../core/models/dashboard.models';
import { GlassPanel } from '../../shared/components/glass-panel/glass-panel';

@Component({
  selector: 'app-settings-page',
  imports: [GlassPanel],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css'
})
export class SettingsPage {
  readonly state = inject(AppStateService);

  setWeather(value: string) {
    this.state.setWeather(value as WeatherCategory);
  }
}
