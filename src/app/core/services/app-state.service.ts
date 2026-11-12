import { computed, Injectable, signal } from '@angular/core';
import { WeatherCategory } from '../models/dashboard.models';
import { WEATHER_PRESETS } from '../data/weather-presets';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  readonly weatherOptions = WEATHER_PRESETS;
  readonly weatherId = signal<WeatherCategory>('rain');
  readonly focusSessions = signal(3);
  readonly focusMinutes = signal(75);
  readonly muted = signal(false);
  readonly activeWeather = computed(() => this.weatherOptions.find((item) => item.id === this.weatherId()) ?? this.weatherOptions[0]);

  setWeather(id: WeatherCategory) {
    this.weatherId.set(id);
  }

  addSession(minutes: number) {
    this.focusSessions.update((value) => value + 1);
    this.focusMinutes.update((value) => value + minutes);
  }

  setMuted(value: boolean) {
    this.muted.set(value);
  }

  resetProgress() {
    this.focusSessions.set(0);
    this.focusMinutes.set(0);
  }
}
