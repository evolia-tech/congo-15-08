import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryParticipation } from '../world-map/world-map.component';

@Component({
  selector: 'app-revelation-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revelation-ranking.component.html',
  styleUrl: './revelation-ranking.component.scss'
})
export class RevelationRankingComponent {
  @Input() participations: CountryParticipation[] = [];

  getBarWidth(count: number): number {
    const max = this.participations[0]?.count || 1;
    return Math.round((count / max) * 100);
  }
}
