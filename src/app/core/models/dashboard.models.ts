export type WeatherCategory = 'clear' | 'rain' | 'cloudy' | 'fog' | 'storm';

export interface WeatherPreset {
  id: WeatherCategory;
  label: string;
  city: string;
  temperature: number;
  wind: number;
  humidity: number;
  accent: string;
}

export interface NavItem {
  label: string;
  icon: string;
}

export interface StatCard {
  label: string;
  value: string;
  delta: string;
  icon: string;
  tone: 'lime' | 'mint' | 'rose' | 'lavender';
}
