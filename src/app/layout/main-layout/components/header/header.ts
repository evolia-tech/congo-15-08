import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { map, tap } from 'rxjs/operators';
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
  isTransparentPage = false;
  cleanUrl = '';

  private scrollY = toSignal(
    fromEvent(window, 'scroll').pipe(
      map(() => window.pageYOffset || document.documentElement.scrollTop || 0)
    ),
    { initialValue: 0 } // Valeur au chargement de la page
  );

  isScrolled = computed(() => this.scrollY() > 50);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
