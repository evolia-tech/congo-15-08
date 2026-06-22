import { Component, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-stats-section',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './stats-section.component.html',
  styleUrl: './stats-section.component.scss',
})
export class StatsSectionComponent implements AfterViewInit, OnChanges {
  @Input() flamesCount: number = 0;

  statsVisible = false;
  statsValues = {
    flames: 0,
    countries: 0,
    departments: 0,
    messages: 0
  };

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['flamesCount'] && !changes['flamesCount'].isFirstChange()) {
      const prevVal = changes['flamesCount'].previousValue || 0;
      const newVal = changes['flamesCount'].currentValue || 0;
      
      if (this.statsVisible) {
        this.animateStat('flames', newVal, prevVal, 1500);
      }
    }
  }

  private setupIntersectionObserver(): void {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.statsVisible) {
            this.statsVisible = true;
            this.triggerStatsAnimation();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const target = document.querySelector('.stats-section');
    if (target) {
      observer.observe(target);
    }
  }

  private triggerStatsAnimation(): void {
    this.animateStat('flames', this.flamesCount, 0, 2200);
    this.animateStat('countries', 24, 0, 1800);
    this.animateStat('departments', 12, 0, 1500);
    this.animateStat('messages', 8920, 0, 2500);
  }

  animateStat(key: 'flames' | 'countries' | 'departments' | 'messages', end: number, start: number = 0, duration: number = 2000): void {
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Cubic ease-out curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      this.statsValues[key] = Math.floor(start + easeProgress * (end - start));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.statsValues[key] = end;
      }
    };

    requestAnimationFrame(step);
  }
}
