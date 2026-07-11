import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FlameCounterComponent } from '../../../shared/components/flame-counter/flame-counter.component';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [FlameCounterComponent],
  templateUrl: './home-hero.component.html',
  styleUrl: './home-hero.component.scss',
})
export class HomeHeroComponent {
  @Input() flamesCount: number = 0;
  @Input() isLoading: boolean = false;
  @Output() allumerFlame = new EventEmitter<void>();

  allumer(): void {
    this.allumerFlame.emit();
  }
}
