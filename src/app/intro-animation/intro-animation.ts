import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { Flame } from '../shared/components/flame/flame';

@Component({
  selector: 'app-intro-animation',
  templateUrl: './intro-animation.html',
  styleUrl: './intro-animation.scss',
  imports: [
    Flame
  ]
})
export class IntroAnimation implements OnInit {
  @Output() animationFinished = new EventEmitter<void>();

  isLeaving = signal<boolean>(false);

  ngOnInit(): void {
    this.startTimeout();
  }

  private startTimeout(): void {
    // 1. Déclenche la classe CSS "fade-out" à 4 secondes
    setTimeout(() => {
      this.isLeaving.set(true);
    }, 5000);

    // 2. Notifie le parent pour détruire le composant à 4.5 secondes
    setTimeout(() => {
      this.animationFinished.emit();
    }, 6500);
  }
}