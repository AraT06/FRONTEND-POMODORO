import { Component, input, signal } from '@angular/core';
import { StatCard as StatCardModel } from '../../../core/models/dashboard.models';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css'
})
export class StatCard {
  readonly card = input.required<StatCardModel>();
  readonly menuOpen = signal(false);
  readonly highlighted = signal(false);
  readonly hidden = signal(false);
}
