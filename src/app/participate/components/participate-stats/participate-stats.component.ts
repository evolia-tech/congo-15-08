import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-participate-stats',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './participate-stats.component.html',
  styleUrl: './participate-stats.component.scss'
})
export class ParticipateStatsComponent {
  @Input() countriesCount = 0;
  @Input() departmentsCount = 0;
}
