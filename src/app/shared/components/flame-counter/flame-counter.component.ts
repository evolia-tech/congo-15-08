import { Component, signal, Input, OnChanges, OnInit, SimpleChanges, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-flame-counter',
  standalone: true,
  imports: [DecimalPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './flame-counter.component.html',
  styleUrl: './flame-counter.component.scss',
})
export class FlameCounterComponent implements OnInit, OnChanges {
  @Input() total: number = 0;
  @Input() lottieUrl: string = 'https://assets9.lottiefiles.com/packages/lf20_fp17c1m1.json';
  @Input() showCountdown: boolean = false;

  displayValue = signal<number>(0);
  private animationFrameId?: number;

  ngOnInit(): void {
    this.loadLottieScript();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['total']) {
      const prevValue = changes['total'].previousValue || 0;
      const newValue = changes['total'].currentValue || 0;
      this.animateValue(prevValue, newValue, 1500); // 1.5 second smooth animation
    }
  }

  private loadLottieScript(): void {
    if (typeof window !== 'undefined' && !window.customElements.get('lottie-player')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@lottiefiles/lottie-player@2.0.4/dist/lottie-player.js';
      script.type = 'text/javascript';
      script.async = true;
      document.head.appendChild(script);
    }
  }

  private animateValue(start: number, end: number, duration: number): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Cubic ease-out curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);

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
