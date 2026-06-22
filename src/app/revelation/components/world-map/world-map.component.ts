import {
  Component, Input, OnChanges, OnInit, SimpleChanges, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CountryParticipation {
  code: string;   // used internally for matching
  name: string;   // display name (French)
  geoName?: string; // English name as in GeoJSON (optional override)
  count: number;
}

interface GeoFeature {
  type: string;
  properties: { name: string };
  geometry: { type: string; coordinates: any[] };
}

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './world-map.component.html',
  styleUrl: './world-map.component.scss'
})
export class WorldMapComponent implements OnInit, OnChanges {
  @Input() participations: CountryParticipation[] = [];

  viewBox = '0 0 1000 500';
  countryPaths: { id: string; d: string; geoName: string; participation: CountryParticipation | null }[] = [];
  hoveredCountry: CountryParticipation | null = null;
  hoveredName = '';
  tooltipX = 0;
  tooltipY = 0;

  private participationByGeoName = new Map<string, CountryParticipation>();
  private WIDTH = 1000;
  private HEIGHT = 500;

  ngOnInit(): void {
    this.loadMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['participations']) {
      this.buildParticipationMap();
    }
  }

  private buildParticipationMap(): void {
    this.participationByGeoName.clear();
    for (const p of this.participations) {
      // Map by geoName (English), falling back to the code
      const key = (p.geoName || '').toLowerCase();
      if (key) this.participationByGeoName.set(key, p);
    }
  }

  private async loadMap(): Promise<void> {
    this.buildParticipationMap();
    try {
      const res = await fetch('/data/world.geojson');
      const geojson = await res.json();
      this.renderFeatures(geojson.features);
    } catch (e) {
      console.error('Failed to load world GeoJSON', e);
    }
  }

  private renderFeatures(features: GeoFeature[]): void {
    this.countryPaths = [];
    for (const feature of features) {
      const geoName = feature.properties?.name || '';
      const participation = this.participationByGeoName.get(geoName.toLowerCase()) || null;
      const d = this.geometryToPath(feature.geometry);
      if (d) {
        this.countryPaths.push({ id: geoName, d, geoName, participation });
      }
    }
  }

  private geometryToPath(geometry: { type: string; coordinates: any[] }): string {
    if (!geometry) return '';
    if (geometry.type === 'Polygon') {
      return this.ringsToPath(geometry.coordinates);
    } else if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates
        .map((poly: any[][]) => this.ringsToPath(poly))
        .join(' ');
    }
    return '';
  }

  private ringsToPath(rings: number[][][]): string {
    return rings.map(ring => {
      const pts = ring.map(([lon, lat]) => this.project(lon, lat));
      return 'M ' + pts.map(([x, y]) => `${x},${y}`).join(' L ') + ' Z';
    }).join(' ');
  }

  private project(lon: number, lat: number): [number, number] {
    const x = ((lon + 180) / 360) * this.WIDTH;
    const y = ((90 - lat) / 180) * this.HEIGHT;
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  }

  getCountryClass(path: { participation: CountryParticipation | null }): string {
    if (!path.participation) return 'country-default';
    return 'country-participated';
  }

  onCountryHover(event: MouseEvent, path: { geoName: string; participation: CountryParticipation | null }): void {
    if (!path.participation) return;
    this.hoveredCountry = path.participation;
    this.hoveredName = path.geoName;
    const el = (event.currentTarget as Element).closest('.map-wrapper');
    const rect = el?.getBoundingClientRect();
    if (rect) {
      this.tooltipX = event.clientX - rect.left + 14;
      this.tooltipY = event.clientY - rect.top - 40;
    }
  }

  onCountryLeave(): void {
    this.hoveredCountry = null;
  }
}
