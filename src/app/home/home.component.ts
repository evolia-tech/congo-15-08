import { Component, ViewChild } from '@angular/core';
import { HomeHeroComponent } from './components/home-hero/home-hero.component';
import { ParticipationFormComponent } from '../shared/components/participation-form/participation-form.component';
import { MapComponent } from './components/map/map.component';
import { StatsSectionComponent } from './components/stats-section/stats-section.component';
import { UnitySectionComponent } from './components/unity-section/unity-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HomeHeroComponent,
    ParticipationFormComponent,
    MapComponent,
    StatsSectionComponent,
    UnitySectionComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  flamesCount = 15420;

  @ViewChild('congoMap') congoMap!: MapComponent;

  incrementFlames(): void {
    this.flamesCount += Math.floor(Math.random() * 500) + 150;
  }

  onParticipationSuccess(event: { firstName: string, location: string }): void {
    this.incrementFlames();
    if (this.congoMap) {
      this.congoMap.incrementDepartmentFlames(event.location);
    }
  }
}
