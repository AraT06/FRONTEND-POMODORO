import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';

type AudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

@Component({
  selector: 'app-audio-panel',
  templateUrl: './audio-panel.html',
  styleUrl: './audio-panel.css'
})
export class AudioPanel {
  readonly muted = input.required<boolean>();
  readonly muteChange = output<boolean>();
  readonly playing = signal(false);
  readonly channels = signal([
    { label: 'Rain', value: 72 },
    { label: 'Wind', value: 48 },
    { label: 'Forest', value: 58 }
  ]);
  private context: AudioContext | undefined;
  private master: GainNode | undefined;
  private rainGain: GainNode | undefined;
  private windGain: GainNode | undefined;
  private forestGain: GainNode | undefined;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => this.stopAudio());
  }

  updateChannel(index: number, value: string) {
    this.channels.update((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, value: Number(value) } : item));
    this.syncGains();
  }

  async toggleAudio() {
    if (this.playing()) {
      this.stopAudio();
      return;
    }

    const audioWindow = window as AudioWindow;
    const AudioContextClass = audioWindow.AudioContext || audioWindow.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }
    this.context = new AudioContextClass();
    this.master = this.context.createGain();
    this.master.gain.value = this.muted() ? 0 : 0.28;
    this.master.connect(this.context.destination);
    this.createRain();
    this.createWind();
    this.createForest();
    this.syncGains();
    await this.context.resume();
    this.playing.set(true);
  }

  toggleMute() {
    const next = !this.muted();
    this.muteChange.emit(next);
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(next ? 0 : 0.28, this.context.currentTime, 0.05);
    }
  }

  private createRain() {
    if (!this.context || !this.master) {
      return;
    }
    const buffer = this.noiseBuffer(2);
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    this.rainGain = this.context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = 'highpass';
    filter.frequency.value = 900;
    source.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.master);
    source.start();
  }

  private createWind() {
    if (!this.context || !this.master) {
      return;
    }
    const buffer = this.noiseBuffer(3);
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    this.windGain = this.context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    source.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.master);
    source.start();
  }

  private createForest() {
    if (!this.context || !this.master) {
      return;
    }
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    this.forestGain = this.context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 540;
    gain.gain.value = 0.04;
    oscillator.connect(gain);
    gain.connect(this.forestGain);
    this.forestGain.connect(this.master);
    oscillator.start();
  }

  private noiseBuffer(seconds: number) {
    const context = this.context as AudioContext;
    const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private syncGains() {
    if (!this.context) {
      return;
    }
    const [rain, wind, forest] = this.channels();
    this.rainGain?.gain.setTargetAtTime(rain.value / 100, this.context.currentTime, 0.08);
    this.windGain?.gain.setTargetAtTime(wind.value / 180, this.context.currentTime, 0.08);
    this.forestGain?.gain.setTargetAtTime(forest.value / 240, this.context.currentTime, 0.08);
  }

  private stopAudio() {
    this.context?.close();
    this.context = undefined;
    this.master = undefined;
    this.rainGain = undefined;
    this.windGain = undefined;
    this.forestGain = undefined;
    this.playing.set(false);
  }
}
