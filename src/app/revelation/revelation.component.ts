import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryParticipation } from './components/world-map/world-map.component';
import { RevelationHeroComponent } from './components/revelation-hero/revelation-hero.component';
import { RevelationMapComponent } from './components/revelation-map/revelation-map.component';
import { RevelationRankingComponent } from './components/revelation-ranking/revelation-ranking.component';

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
  targetFlames = 742158;
  displayFlames = signal<number>(0);
  private animationFrameId?: number;

  /**
   * Participation data — geoName must match the English country name in world.geojson
   */
  countryParticipations: CountryParticipation[] = [
    { code: 'CG', name: 'République du Congo', geoName: 'Republic of the Congo', count: 285430 },
    { code: 'CD', name: 'RD Congo', geoName: 'Democratic Republic of the Congo', count: 112850 },
    { code: 'FR', name: 'France', geoName: 'France', count: 98240 },
    { code: 'BE', name: 'Belgique', geoName: 'Belgium', count: 42180 },
    { code: 'CA', name: 'Canada', geoName: 'Canada', count: 35620 },
    { code: 'US', name: 'États-Unis', geoName: 'United States of America', count: 28950 },
    { code: 'GA', name: 'Gabon', geoName: 'Gabon', count: 24310 },
    { code: 'CM', name: 'Cameroun', geoName: 'Cameroon', count: 19870 },
    { code: 'GB', name: 'Royaume-Uni', geoName: 'United Kingdom', count: 15640 },
    { code: 'DE', name: 'Allemagne', geoName: 'Germany', count: 12380 },
    { code: 'SN', name: 'Sénégal', geoName: 'Senegal', count: 9820 },
    { code: 'CI', name: "Côte d'Ivoire", geoName: "Ivory Coast", count: 8740 },
    { code: 'NG', name: 'Nigéria', geoName: 'Nigeria', count: 7650 },
    { code: 'AO', name: 'Angola', geoName: 'Angola', count: 6430 },
    { code: 'ZA', name: 'Afrique du Sud', geoName: 'South Africa', count: 5210 },
    { code: 'IT', name: 'Italie', geoName: 'Italy', count: 4890 },
    { code: 'ES', name: 'Espagne', geoName: 'Spain', count: 3760 },
    { code: 'AE', name: 'Émirats Arabes Unis', geoName: 'United Arab Emirates', count: 2540 },
    { code: 'BR', name: 'Brésil', geoName: 'Brazil', count: 2180 },
    { code: 'CH', name: 'Suisse', geoName: 'Switzerland', count: 1890 },
    { code: 'AU', name: 'Australie', geoName: 'Australia', count: 1340 },
    { code: 'PT', name: 'Portugal', geoName: 'Portugal', count: 980 },
    { code: 'MA', name: 'Maroc', geoName: 'Morocco', count: 870 },
    { code: 'ML', name: 'Mali', geoName: 'Mali', count: 650 },
    { code: 'GN', name: 'Guinée', geoName: 'Guinea', count: 540 },
  ].sort((a, b) => b.count - a.count);

  get totalParticipants(): number {
    return this.countryParticipations.reduce((s, c) => s + c.count, 0);
  }

  get activeCountries(): number {
    return this.countryParticipations.length;
  }

  ngOnInit(): void {
    this.animateCounter(this.targetFlames, 3500);
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
