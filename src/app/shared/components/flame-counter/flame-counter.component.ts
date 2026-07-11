import { Component, signal, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Flame } from '../flame/flame';

@Component({
  selector: 'app-flame-counter',
  templateUrl: './flame-counter.component.html',
  styleUrl: './flame-counter.component.scss',
  imports: [
    DecimalPipe,
    Flame
  ]

})
export class FlameCounterComponent implements OnChanges {
  @Input() total: number = 0;
  @Input() showCountdown: boolean = false;
  @Input() isLoading: boolean = false;

  displayValue = signal<number>(0);
  private animationFrameId?: number;

  get countdownText(): string {
    const target = new Date(2026, 7, 15, 0, 0, 0); // August 15, 2026 (Month is 0-indexed)
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) {
      return 'J-0';
    }
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `J-${days}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['total']) {
      const prevValue = changes['total'].previousValue || 0;
      const newValue = changes['total'].currentValue || 0;
      this.animateValue(prevValue, newValue, 1500); // Animation fluide de 1.5s pour les chiffres
    }
  }

  private animateValue(start: number, end: number, duration: number): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Courbe d'easing cubique

      this.displayValue.update(() => Math.floor(start + easeProgress * (end - start)));

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(step);
      } else {
        this.displayValue.set(end);
      }
    };

    this.animationFrameId = requestAnimationFrame(step);
  }
}