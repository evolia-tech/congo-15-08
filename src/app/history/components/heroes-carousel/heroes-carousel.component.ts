import { Component, ElementRef, ViewChild, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  caption?: string;
}

interface HistoricalFigure {
  id: string;
  name: string;
  role: string;
  years: string;
  bio: string;
  image: string;
  media: MediaItem[];
}

@Component({
  selector: 'app-heroes-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heroes-carousel.component.html',
  styleUrl: './heroes-carousel.component.scss'
})
export class HeroesCarouselComponent implements OnInit {
  @ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLElement>;
  @ViewChild('heroDialog') heroDialog!: ElementRef<HTMLDialogElement>;

  selectedFigure: HistoricalFigure | null = null;
  selectedMediaIndex = 0;

  heroes: HistoricalFigure[] = [];

  private readonly sanitizer = inject(DomSanitizer);
  private readonly http = inject(HttpClient);

  ngOnInit(): void {
    this.loadHeroes();
  }

  loadHeroes(): void {
    this.http.get<HistoricalFigure[]>(`${environment.apiUrl}/heroes`).subscribe({
      next: (data) => {
        this.heroes = data;
      },
      error: (err) => {
        console.error('Failed to load heroes from API', err);
      }
    });
  }

  openDialog(figure: HistoricalFigure): void {
    this.selectedFigure = figure;
    this.selectedMediaIndex = 0;
    setTimeout(() => {
      this.heroDialog?.nativeElement?.showModal();
    }, 0);
  }

  closeDialog(): void {
    this.heroDialog?.nativeElement?.close();
    this.selectedFigure = null;
  }

  selectMedia(index: number): void {
    this.selectedMediaIndex = index;
  }

  getSafeYoutubeUrl(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
    );
  }

  scrollCarousel(direction: 'prev' | 'next'): void {
    const track = this.carouselTrack?.nativeElement;
    if (!track) return;
    const cardWidth = track.querySelector('.hero-card')?.clientWidth ?? 320;
    const gap = 16; // 1rem gap
    const scrollAmount = cardWidth + gap;
    track.scrollBy({ left: direction === 'next' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.selectedFigure) {
      this.closeDialog();
    }
  }

  onDialogBackdropClick(event: MouseEvent): void {
    const dialog = this.heroDialog?.nativeElement;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const clickedOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (clickedOutside) {
      this.closeDialog();
    }
  }
}
