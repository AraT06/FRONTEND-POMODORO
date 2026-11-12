import { Component, input, output } from '@angular/core';
import { WeatherCategory, WeatherPreset } from '../../core/models/dashboard.models';

@Component({
  selector: 'app-weather-panel',
  templateUrl: './weather-panel.html',
  styleUrl: './weather-panel.css'
})
export class WeatherPanel {
  readonly options = input.required<WeatherPreset[]>();
  readonly activeId = input.required<WeatherCategory>();
  readonly weatherChange = output<WeatherCategory>();
}
