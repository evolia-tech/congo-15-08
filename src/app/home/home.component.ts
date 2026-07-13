import { Component, ViewChild, OnInit, inject, computed } from '@angular/core';
import { HomeHeroComponent } from './components/home-hero/home-hero.component';
import { ParticipationComponent } from './components/participation/participation.component';
import { MapComponent } from './components/map/map.component';
import { StatsSectionComponent } from './components/stats-section/stats-section.component';
import { UnitySectionComponent } from './components/unity-section/unity-section.component';
import { Newletters } from './components/newletters/newletters';
import { ParticipationService } from '../shared/services/participation.service';
import { ProgramScheduleComponent } from '../shared/components/program-schedule/program-schedule.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HomeHeroComponent,
    ParticipationComponent,
    MapComponent,
    StatsSectionComponent,
    UnitySectionComponent,
    Newletters,
    ProgramScheduleComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly participationService = inject(ParticipationService);

  @ViewChild('congoMap') congoMap!: MapComponent;

  readonly stats = computed(() => this.participationService.stats());
  readonly isLoadingStats = this.participationService.isLoadingStats;

  get flamesCount(): number {
    return this.stats()?.totalParticipations || 0;
  }

  ngOnInit(): void {
    this.participationService.loadStats();
  }

  incrementFlames(): void {
    // Scroll smoothly to participation component on hero button click
    const formElement = document.querySelector('app-participation');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onParticipationSuccess(event: { firstName: string, location: string }): void {
    if (this.congoMap) {
      this.congoMap.incrementDepartmentFlames(event.location);
    }
  }
}
