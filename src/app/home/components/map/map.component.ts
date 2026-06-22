import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

interface Department {
  name: string;
  flames: number;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent {
  departmentsData: Department[] = [
    { name: 'Brazzaville', flames: 5240 },
    { name: 'Pointe-Noire', flames: 3820 },
    { name: 'Pool', flames: 1540 },
    { name: 'Kouilou', flames: 910 },
    { name: 'Bouenza', flames: 820 },
    { name: 'Niari', flames: 630 },
    { name: 'Cuvette', flames: 510 },
    { name: 'Plateaux', flames: 320 },
    { name: 'Sangha', flames: 280 },
    { name: 'Likouala', flames: 210 },
    { name: 'Lékoumou', flames: 180 },
    { name: 'Cuvette-Ouest', flames: 120 },
  ];

  selectedDept: Department | null = null;
  activeFlashDept: string | null = null;

  get totalFlames(): number {
    return this.departmentsData.reduce((acc, curr) => acc + curr.flames, 0);
  }

  constructor() {
    // Select Brazzaville by default to show details
    this.selectedDept = this.departmentsData[0];
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
      // Increment count
      dept.flames += Math.floor(Math.random() * 150) + 100;
      this.activeFlashDept = dept.name;
      this.selectDept(dept.name);

      // Reset flash effect after animation duration
      setTimeout(() => {
        this.activeFlashDept = null;
      }, 1200);
    }
  }
}
