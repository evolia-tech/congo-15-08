import { Component } from '@angular/core';

@Component({
  selector: 'app-unity-section',
  standalone: true,
  imports: [],
  templateUrl: './unity-section.component.html',
  styleUrl: './unity-section.component.scss',
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
