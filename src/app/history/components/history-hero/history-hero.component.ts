import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-history-hero',
  standalone: true,
  templateUrl: './history-hero.component.html',
  styleUrl: './history-hero.component.scss',
  imports: [
    NgOptimizedImage
  ],
})
export class HistoryHeroComponent { }
