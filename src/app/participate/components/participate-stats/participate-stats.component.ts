import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ParticipationService,
  ParticipationStats,
} from '../../../shared/services/participation.service';

@Component({
  selector: 'app-participate-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './participate-stats.component.html',
  styleUrl: './participate-stats.component.scss',
})
export class ParticipateStatsComponent {
  private participationService = inject<ParticipationService>(ParticipationService);

  /** Derived signals — components only read, never write */
  readonly stats = computed<ParticipationStats | null>(
    () => this.participationService.stats()
  );
  readonly isLoading = computed<boolean>(
    () => this.participationService.isLoadingStats()
  );
}
