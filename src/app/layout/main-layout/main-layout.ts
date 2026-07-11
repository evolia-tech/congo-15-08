import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { ShareModalComponent } from '../../shared/components/share-modal/share-modal.component';
import { ParticipationService } from '../../shared/services/participation.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  imports: [
    RouterOutlet,
    Header,
    Footer,
    ShareModalComponent
  ]
})
export class MainLayout {
  showFloatingButton = signal<boolean>(true);

  constructor(public participationService: ParticipationService) { }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    console.log("here");
    if (typeof window === 'undefined') return;
    const threshold = window.innerHeight;
    this.showFloatingButton.set(window.scrollY > threshold);
  }
}
