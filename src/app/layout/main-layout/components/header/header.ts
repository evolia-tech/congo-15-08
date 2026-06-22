import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: {
    '[class.scrolled]': 'isScrolled || !isTransparentPage',
    '[class.home-transparent]': 'isTransparentPage && !isScrolled'
  }
})
export class Header {
  isMobileMenuOpen = false;
  isScrolled = false;
  isTransparentPage = false;
  cleanUrl = '';

  constructor(private router: Router) {
    this.checkRoute(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkRoute(event.urlAfterRedirects || event.url);
    });
  }

  private checkRoute(url: string): void {
    this.cleanUrl = url.split('?')[0].split('#')[0];
    this.isTransparentPage = 
      this.cleanUrl === '/' || 
      this.cleanUrl === '/home' || 
      this.cleanUrl === '' || 
      this.cleanUrl === '/histoire' || 
      this.cleanUrl === '/participer' ||
      this.cleanUrl === '/revelation';
    this.checkScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScroll();
  }

  private checkScroll(): void {
    if (typeof window !== 'undefined') {
      const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      this.isScrolled = scrollPos > 100;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
