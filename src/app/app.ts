import { Component, ViewChild, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IntroAnimation } from './intro-animation/intro-animation';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    RouterOutlet,
    IntroAnimation
  ],
})
export class App {
  // L'animation s'activera TOUJOURS à l'atterrissage et au refresh (F5)
  showIntro = signal<boolean>(true);

  // Fonction appelée dès que les 4,5 secondes sont écoulées
  onIntroFinished(): void {
    this.showIntro.set(false);
  }
}
