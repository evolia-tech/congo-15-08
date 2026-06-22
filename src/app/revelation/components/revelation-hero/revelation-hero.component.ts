import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-revelation-hero',
  imports: [CommonModule],
  templateUrl: './revelation-hero.component.html',
  styleUrl: './revelation-hero.component.scss'
})
export class RevelationHeroComponent {
  displayFlames = input<number>(0);
}
