import { Component, inject, computed, signal, effect, NgZone } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ParticipationService, ParticipationStats } from '../../../shared/services/participation.service';

@Component({
  selector: 'app-stats-section',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './stats-section.component.html',
  styleUrl: './stats-section.component.scss',
})
export class StatsSectionComponent {
  private readonly participationService = inject(ParticipationService);
  private readonly ngZone = inject(NgZone);

  private hasAnimated = false;

  flames = signal<number>(0);
  countries = signal<number>(0);
  departments = signal<number>(0);
  messages = signal<number>(0);

  readonly stats = computed(() => this.participationService.stats());

  constructor() {
    // Reactively trigger animation only when stats are loaded
    effect(() => {
      const currentStats = this.stats();
      if (!currentStats) return;

      if (!this.hasAnimated) {
        this.hasAnimated = true;
        this.ngZone.runOutsideAngular(() => {
          this.triggerStatsAnimation(currentStats);
        });
      } else {
        // Smoothly update signals inside Angular zone for real-time WebSocket count changes
        this.ngZone.run(() => {
          this.flames.set(currentStats.totalParticipations);
          this.countries.set(currentStats.diasporaCountries);
          this.departments.set(currentStats.departmentsParticipated);
          this.messages.set(currentStats.totalParticipations);
        });
      }
    });
  }

  private triggerStatsAnimation(currentStats: ParticipationStats): void {
    const flamesTarget = currentStats.totalParticipations;
    const countriesTarget = currentStats.diasporaCountries;
    const deptsTarget = currentStats.departmentsParticipated;
    const messagesTarget = currentStats.totalParticipations; // 1 message per participation

    this.animateStat('flames', flamesTarget, 0, 2200);
    this.animateStat('countries', countriesTarget, 0, 1800);
    this.animateStat('departments', deptsTarget, 0, 1500);
    this.animateStat('messages', messagesTarget, 0, 2500);
  }

  animateStat(key: 'flames' | 'countries' | 'departments' | 'messages', end: number, start: number = 0, duration: number = 2000): void {
    const startTime = performance.now();
    const signalToUpdate = this[key];

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const val = Math.floor(start + easeProgress * (end - start));

      this.ngZone.run(() => {
        signalToUpdate.set(val);
      });

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.ngZone.run(() => {
          signalToUpdate.set(end);
        });
      }
    };

    requestAnimationFrame(step);
  }
}
