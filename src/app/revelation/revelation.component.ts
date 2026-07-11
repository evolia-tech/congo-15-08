import { Component, OnInit, OnDestroy, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryParticipation } from './components/world-map/world-map.component';
import { RevelationHeroComponent } from './components/revelation-hero/revelation-hero.component';
import { RevelationMapComponent } from './components/revelation-map/revelation-map.component';
import { RevelationRankingComponent } from './components/revelation-ranking/revelation-ranking.component';
import { ParticipationService } from '../shared/services/participation.service';

@Component({
  selector: 'app-revelation',
  templateUrl: './revelation.component.html',
  styleUrl: './revelation.component.scss',
  imports: [
    CommonModule,
    RevelationHeroComponent,
    RevelationMapComponent,
    RevelationRankingComponent
  ]
})
export class RevelationComponent implements OnInit, OnDestroy {
  private participationService = inject(ParticipationService);
  readonly stats = computed(() => this.participationService.stats());

  displayFlames = signal<number>(0);
  private animationFrameId?: number;
  private hasAnimated = false;

  private readonly countryMeta: { [code: string]: { name: string; geoName: string } } = {
    'CG': { name: 'République du Congo', geoName: 'Republic of the Congo' },
    'CD': { name: 'RD Congo', geoName: 'Democratic Republic of the Congo' },
    'FR': { name: 'France', geoName: 'France' },
    'BE': { name: 'Belgique', geoName: 'Belgium' },
    'CA': { name: 'Canada', geoName: 'Canada' },
    'US': { name: 'États-Unis', geoName: 'United States of America' },
    'GA': { name: 'Gabon', geoName: 'Gabon' },
    'CM': { name: 'Cameroun', geoName: 'Cameroon' },
    'GB': { name: 'Royaume-Uni', geoName: 'United Kingdom' },
    'DE': { name: 'Allemagne', geoName: 'Germany' },
    'SN': { name: 'Sénégal', geoName: 'Senegal' },
    'CI': { name: "Côte d'Ivoire", geoName: 'Ivory Coast' },
    'NG': { name: 'Nigéria', geoName: 'Nigeria' },
    'AO': { name: 'Angola', geoName: 'Angola' },
    'ZA': { name: 'Afrique du Sud', geoName: 'South Africa' },
    'IT': { name: 'Italie', geoName: 'Italy' },
    'ES': { name: 'Espagne', geoName: 'Spain' },
    'AE': { name: 'Émirats Arabes Unis', geoName: 'United Arab Emirates' },
    'BR': { name: 'Brésil', geoName: 'Brazil' },
    'CH': { name: 'Suisse', geoName: 'Switzerland' },
    'AU': { name: 'Australie', geoName: 'Australia' },
    'PT': { name: 'Portugal', geoName: 'Portugal' },
    'MA': { name: 'Maroc', geoName: 'Morocco' },
    'ML': { name: 'Mali', geoName: 'Mali' },
    'GN': { name: 'Guinée', geoName: 'Guinea' }
  };

  /**
   * Participation data derived reactively from backend stats
   */
  readonly countryParticipations = computed<CountryParticipation[]>(() => {
    const dbStats = this.stats();
    if (!dbStats?.countries) {
      return [];
    }

    return dbStats.countries.map(c => {
      const codeUpper = c.countryId.toUpperCase();
      const meta = this.countryMeta[codeUpper] || { name: c.countryId, geoName: c.countryId };
      return {
        code: codeUpper,
        name: meta.name,
        geoName: meta.geoName,
        count: c.count
      };
    }).sort((a, b) => b.count - a.count);
  });

  constructor() {
    effect(() => {
      const currentStats = this.stats();
      if (currentStats && !this.hasAnimated) {
        this.hasAnimated = true;
        this.animateCounter(currentStats.totalParticipations, 3500);
      }
    });
  }

  get totalParticipants(): number {
    return this.countryParticipations().reduce((s, c) => s + c.count, 0);
  }

  get activeCountries(): number {
    return this.countryParticipations().length;
  }

  ngOnInit(): void {
    this.participationService.loadStats();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  private animateCounter(end: number, duration: number): void {
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      this.displayFlames.update(() => Math.floor(ease * end));
      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(step);
      } else {
        this.displayFlames.set(end);
      }
    };
    this.animationFrameId = requestAnimationFrame(step);
  }
}
