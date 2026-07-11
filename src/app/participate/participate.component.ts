import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipateHeroComponent } from './components/participate-hero/participate-hero.component';
import { ParticipateReassuranceComponent } from './components/participate-reassurance/participate-reassurance.component';
import { ParticipateStatsComponent } from './components/participate-stats/participate-stats.component';
import { ParticipationService } from '../shared/services/participation.service';
import { ParticipateMessagesComponent } from './components/participate-messages/participate-messages.component';

@Component({
  selector: 'app-participate',
  standalone: true,
  imports: [
    CommonModule,
    ParticipateHeroComponent,
    ParticipateReassuranceComponent,
    ParticipateStatsComponent,
    ParticipateMessagesComponent
  ],
  templateUrl: './participate.component.html',
  styleUrl: './participate.component.scss',
})
export class ParticipateComponent implements OnInit {
  showSuccess = false;
  private localIncrement = 0;

  private participationService = inject(ParticipationService);
  readonly stats = computed(() => this.participationService.stats());
  readonly isLoadingStats = this.participationService.isLoadingStats;

  get flamesTotal(): number {
    return (this.stats()?.totalParticipations || 0) + this.localIncrement;
  }

  ngOnInit(): void {
    // Trigger the HTTP request; the result is stored in the service signal
    // and consumed reactively by ParticipateStatsComponent
    this.participationService.loadStats();
  }

  onFormSuccess(event: { firstName: string; location: string }): void {
    this.localIncrement++;
    this.showSuccess = true;
  }

  onResetSuccess(): void {
    this.showSuccess = false;
  }
}
