import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd, ActivatedRoute } from '@angular/router';
import { map, filter } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  isMobileMenuOpen = false;

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  /** Signal mis à jour à chaque navigation depuis la donnée de route `isBackgrounded` */
  private isBackgrounded = signal(false);

  /** Signal de position de défilement, initialisé à 0 sans bloquer le rendu */
  private scrollY = toSignal(
    fromEvent(window, 'scroll').pipe(
      map(() => window.pageYOffset || document.documentElement.scrollTop || 0)
    ),
    { initialValue: 0 }
  );

  /**
   * `.scrolled` est actif si :
   *  - la route déclare `isBackgrounded: true`, OU
   *  - l'utilisateur a défilé de plus de 50px
   */
  isScrolled = computed(() => this.isBackgrounded() || this.scrollY() > 50);

  constructor() {
    // Écoute chaque fin de navigation pour lire `isBackgrounded` sans bloquer le rendu initial
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Remonte la hiérarchie des routes enfants jusqu'à la route feuille active
      let route = this.activatedRoute;
      while (route.firstChild) {
        route = route.firstChild;
      }
      const bg = route.snapshot.data?.['isBackgrounded'];
      this.isBackgrounded.set(bg === true);
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
