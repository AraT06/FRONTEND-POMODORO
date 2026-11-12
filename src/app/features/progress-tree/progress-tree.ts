import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-tree',
  templateUrl: './progress-tree.html',
  styleUrl: './progress-tree.css'
})
export class ProgressTree {
  readonly depth = input.required<number>();
  readonly wind = input.required<number>();
  readonly branches = computed(() => Array.from({ length: Math.min(this.depth() + 5, 14) }, (_, index) => index));
  readonly sway = computed(() => Math.min(this.wind() / 5, 8));
  readonly stage = computed(() => {
    const depth = this.depth();
    if (depth <= 0) {
      return { label: 'Semilla', description: 'Primer inicio de enfoque', canopy: 18 };
    }
    if (depth < 3) {
      return { label: 'Brote', description: 'El hábito empieza a crecer', canopy: 30 };
    }
    if (depth < 6) {
      return { label: 'Árbol joven', description: 'Sesiones constantes', canopy: 48 };
    }
    return { label: 'Árbol maduro', description: 'Rutina consolidada', canopy: 64 };
  });
  readonly stages = ['Semilla', 'Brote', 'Árbol joven', 'Árbol maduro'];
  readonly activeStageIndex = computed(() => this.stages.indexOf(this.stage().label));
}
