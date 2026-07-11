import { Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { WorldMapComponent, CountryParticipation } from '../world-map/world-map.component';

@Component({
  selector: 'app-revelation-map',
  templateUrl: './revelation-map.component.html',
  styleUrl: './revelation-map.component.scss',
  imports: [
    NgOptimizedImage,
    CommonModule,
    WorldMapComponent
  ]
})

export class RevelationMapComponent {
  @Input() participations: CountryParticipation[] = [];
  @Input() totalParticipants = 0;
  @Input() activeCountries = 0;
}
