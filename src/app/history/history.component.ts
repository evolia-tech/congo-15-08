import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryHeroComponent } from './components/history-hero/history-hero.component';
import { HeroesCarouselComponent } from './components/heroes-carousel/heroes-carousel.component';
import { PresidentAllocutionComponent } from './components/president-allocution/president-allocution.component';
import { HistoryTimelineComponent } from './components/history-timeline/history-timeline.component';
import { HistoryVisionComponent } from './components/history-vision/history-vision.component';
import { HistoryActionsComponent } from './components/history-actions/history-actions.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    HistoryHeroComponent,
    HeroesCarouselComponent,
    PresidentAllocutionComponent,
    HistoryTimelineComponent,
    HistoryVisionComponent,
    HistoryActionsComponent
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent { }
