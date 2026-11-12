import { Component, computed, DestroyRef, inject, output, signal } from '@angular/core';

@Component({
  selector: 'app-pomodoro-timer',
  templateUrl: './pomodoro-timer.html',
  styleUrl: './pomodoro-timer.css'
})
export class PomodoroTimer {
  readonly sessionCompleted = output<number>();
  readonly totalSeconds = signal(25 * 60);
  readonly remaining = signal(25 * 60);
  readonly running = signal(false);
  readonly mode = signal<'Focus' | 'Short break'>('Focus');
  readonly progress = computed(() => 100 - (this.remaining() / this.totalSeconds()) * 100);
  readonly time = computed(() => {
    const minutes = Math.floor(this.remaining() / 60).toString().padStart(2, '0');
    const seconds = Math.floor(this.remaining() % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  });
  private interval: ReturnType<typeof setInterval> | undefined;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => this.stopInterval());
  }

  toggle() {
    this.running() ? this.pause() : this.start();
  }

  start() {
    if (this.interval) {
      return;
    }

    this.running.set(true);
    this.interval = setInterval(() => {
      const next = this.remaining() - 1;
      if (next <= 0) {
        this.complete();
        return;
      }
      this.remaining.set(next);
    }, 1000);
  }

  pause() {
    this.running.set(false);
    this.stopInterval();
  }

  reset() {
    this.pause();
    this.mode.set('Focus');
    this.totalSeconds.set(25 * 60);
    this.remaining.set(25 * 60);
  }

  quickComplete() {
    this.complete();
  }

  private complete() {
    const wasFocus = this.mode() === 'Focus';
    this.pause();
    if (wasFocus) {
      this.sessionCompleted.emit(25);
      this.mode.set('Short break');
      this.totalSeconds.set(5 * 60);
      this.remaining.set(5 * 60);
      return;
    }
    this.mode.set('Focus');
    this.totalSeconds.set(25 * 60);
    this.remaining.set(25 * 60);
  }

  private stopInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}
