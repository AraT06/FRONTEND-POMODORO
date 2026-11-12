import { WeatherPreset } from '../models/dashboard.models';

export const WEATHER_PRESETS: WeatherPreset[] = [
  { id: 'clear', label: 'Soleado', city: 'Cochabamba', temperature: 26, wind: 8, humidity: 34, accent: '#d9f5ac' },
  { id: 'rain', label: 'Lluvia', city: 'La Paz', temperature: 13, wind: 19, humidity: 78, accent: '#93d9d1' },
  { id: 'cloudy', label: 'Nublado', city: 'Santa Cruz', temperature: 24, wind: 12, humidity: 62, accent: '#aeb8ef' },
  { id: 'fog', label: 'Neblina', city: 'Sucre', temperature: 16, wind: 6, humidity: 86, accent: '#c6f4f1' },
  { id: 'storm', label: 'Tormenta', city: 'Tarija', temperature: 18, wind: 31, humidity: 91, accent: '#f4a8b3' }
];
