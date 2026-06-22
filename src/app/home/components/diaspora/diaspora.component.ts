import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

interface CountryInfo {
  name: string;
  code: string;
  flag: string;
  flames: number;
}

@Component({
  selector: 'app-diaspora',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './diaspora.component.html',
  styleUrl: './diaspora.component.scss',
})
export class DiasporaComponent {
  countriesData: CountryInfo[] = [
    { name: 'France', code: 'FR', flag: '🇫🇷', flames: 1250 },
    { name: 'Canada', code: 'CA', flag: '🇨🇦', flames: 740 },
    { name: 'Belgique', code: 'BE', flag: '🇧🇪', flames: 620 },
    { name: 'États-Unis', code: 'US', flag: '🇺🇸', flames: 480 },
    { name: 'Sénégal', code: 'SN', flag: '🇸🇳', flames: 350 },
    { name: 'Côte d\'Ivoire', code: 'CI', flag: '🇨🇮', flames: 310 },
    { name: 'Cameroun', code: 'CM', flag: '🇨🇲', flames: 290 },
  ];

  activeFlashCountry: string | null = null;

  incrementCountryFlames(countryName: string): void {
    if (!countryName) return;

    const cleanInput = countryName.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const country = this.countriesData.find(c => {
      const cleanName = c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return cleanName === cleanInput || cleanInput.includes(cleanName) || cleanName.includes(cleanInput);
    });

    if (country) {
      country.flames += Math.floor(Math.random() * 100) + 50;
      this.activeFlashCountry = country.name;

      setTimeout(() => {
        this.activeFlashCountry = null;
      }, 1200);
    }
  }
}
