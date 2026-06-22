import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldMapComponent, CountryParticipation } from '../world-map/world-map.component';

@Component({
  selector: 'app-revelation-map',
  standalone: true,
  imports: [CommonModule, WorldMapComponent],
  templateUrl: './revelation-map.component.html',
  styleUrl: './revelation-map.component.scss'
})
export class RevelationMapComponent {
  @Input() participations: CountryParticipation[] = [];
  @Input() totalParticipants = 0;
  @Input() activeCountries = 0;
}
