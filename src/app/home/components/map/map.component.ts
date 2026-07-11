import { Component, OnInit, inject, computed, signal, effect } from '@angular/core';
import { CommonModule, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { ParticipationService, ParticipationStats } from '../../../shared/services/participation.service';

interface Department {
  name: string;
  flames: number;
}

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  imports: [NgOptimizedImage, CommonModule, DecimalPipe],
})
export class MapComponent implements OnInit {
  // Default structure of 12 departments with 0 flames, to be filled by DB values
  departmentsData: Department[] = [
    { name: 'Brazzaville', flames: 0 },
    { name: 'Pointe-Noire', flames: 0 },
    { name: 'Pool', flames: 0 },
    { name: 'Kouilou', flames: 0 },
    { name: 'Bouenza', flames: 0 },
    { name: 'Niari', flames: 0 },
    { name: 'Cuvette', flames: 0 },
    { name: 'Plateaux', flames: 0 },
    { name: 'Sangha', flames: 0 },
    { name: 'Likouala', flames: 0 },
    { name: 'Lékoumou', flames: 0 },
    { name: 'Cuvette-Ouest', flames: 0 },
  ];

  selectedDept: Department | null = null;
  activeFlashDept: string | null = null;
  activeTab = signal<'departments' | 'diaspora'>('departments');

  private participationService = inject<ParticipationService>(ParticipationService);

  readonly stats = computed(() => this.participationService.stats());

  /** Reads diasporaCountries from the shared stats signal */
  readonly diasporaCountries = computed<number>(
    () => this.stats()?.diasporaCountries ?? 0
  );

  private readonly countryNames: { [code: string]: string } = {
    'FR': 'France',
    'BE': 'Belgique',
    'CA': 'Canada',
    'US': 'États-Unis',
    'SN': 'Sénégal',
    'CI': "Côte d'Ivoire",
    'CM': 'Cameroun',
  };

  /** Computed list of diaspora countries with counts from DB */
  readonly diasporaData = computed(() => {
    const dbStats = this.stats();
    if (!dbStats?.countries) return [];

    return dbStats.countries
      .filter((c) => c.countryId.toUpperCase() !== 'CG')
      .map((c) => ({
        name: this.countryNames[c.countryId.toUpperCase()] || c.countryId,
        flames: c.count,
      }))
      .sort((a, b) => b.flames - a.flames);
  });

  get totalFlames(): number {
    return this.stats()?.totalParticipations || this.departmentsData.reduce((acc, curr) => acc + curr.flames, 0);
  }

  constructor() {
    // Reactively update local department counts from database stats
    effect(() => {
      const dbStats = this.stats();
      if (dbStats) {
        this.departmentsData.forEach((dept) => {
          const dbDept = dbStats.departments?.find(
            (d) => d.name.toLowerCase() === dept.name.toLowerCase()
          );
          dept.flames = dbDept ? dbDept.count : 0;
        });

        // Sort descending
        this.departmentsData.sort((a, b) => b.flames - a.flames);

        // Select the top department by default
        if (!this.selectedDept && this.departmentsData.length > 0) {
          this.selectedDept = this.departmentsData[0];
        }
      }
    });
  }

  ngOnInit(): void {
    // Trigger stats load (no-op if already loaded by another component)
    this.participationService.loadStats();
    
    // Fallback selection if stats aren't loaded yet
    if (this.departmentsData.length > 0) {
      this.selectedDept = this.departmentsData[0];
    }
  }

  getDepartmentColor(name: string): string {
    if (this.selectedDept?.name === name) {
      return '#ffe259';
    }
    return 'transparent';
  }

  getTooltipText(name: string): string {
    const dept = this.departmentsData.find(d => d.name === name);
    const flames = dept ? dept.flames : 0;
    return `${name} : ${flames.toLocaleString('fr-FR')} flammes`;
  }

  selectDept(name: string): void {
    const dept = this.departmentsData.find(d => d.name === name);
    this.selectedDept = dept || null;
  }

  incrementDepartmentFlames(locationName: string): void {
    if (!locationName) return;

    const cleanLoc = locationName.toLowerCase().trim();

    // Find department by matching name (strip accents for safety)
    const dept = this.departmentsData.find(d => {
      const cleanName = d.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const cleanInput = cleanLoc.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return cleanName === cleanInput || cleanInput.includes(cleanName) || cleanName.includes(cleanInput);
    });

    if (dept) {
      // Local animate increment
      dept.flames += 1;
      this.activeFlashDept = dept.name;
      this.selectDept(dept.name);

      // Reset flash effect after animation duration
      setTimeout(() => {
        this.activeFlashDept = null;
      }, 1200);
    }
  }
}
