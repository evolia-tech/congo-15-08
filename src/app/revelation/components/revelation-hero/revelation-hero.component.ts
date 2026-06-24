import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Flame } from '../../../shared/components/flame/flame';

@Component({
  selector: 'app-revelation-hero',
  templateUrl: './revelation-hero.component.html',
  styleUrl: './revelation-hero.component.scss',
  imports: [
    CommonModule,
    Flame
  ],
})
export class RevelationHeroComponent {
  displayFlames = input<number>(0);
}
