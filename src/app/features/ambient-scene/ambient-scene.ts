import { Component, computed, input } from '@angular/core';
import { WeatherPreset } from '../../core/models/dashboard.models';

interface SceneParticle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
}

@Component({
  selector: 'app-ambient-scene',
  templateUrl: './ambient-scene.html',
  styleUrl: './ambient-scene.css'
})
export class AmbientScene {
  readonly weather = input.required<WeatherPreset>();
  readonly particles = computed<SceneParticle[]>(() => {
    const count = this.weather().id === 'rain' ? 95 : this.weather().id === 'storm' ? 115 : this.weather().id === 'clear' ? 18 : 30;
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      x: (index * 37) % 104,
      y: (index * 23) % 100,
      delay: -((index * 0.07) % 3),
      duration: 0.52 + ((index % 7) * 0.045),
      size: 0.75 + ((index % 5) * 0.18)
    }));
  });
}
