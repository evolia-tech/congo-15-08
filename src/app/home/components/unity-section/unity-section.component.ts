import { Component } from '@angular/core';
import { Flame } from '../../../shared/components/flame/flame';

@Component({
  selector: 'app-unity-section',
  templateUrl: './unity-section.component.html',
  styleUrl: './unity-section.component.scss',
  imports: [
    Flame
  ],
})

export class UnitySectionComponent {
  scrollToForm(): void {
    if (typeof window !== 'undefined') {
      const element = document.querySelector('.participation-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}
