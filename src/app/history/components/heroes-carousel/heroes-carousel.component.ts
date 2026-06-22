import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
export class HeroesCarouselComponent {
  @ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLElement>;
  @ViewChild('heroDialog') heroDialog!: ElementRef<HTMLDialogElement>;

  selectedFigure: HistoricalFigure | null = null;
  selectedMediaIndex = 0;

  constructor(private sanitizer: DomSanitizer) {}

  heroes: HistoricalFigure[] = [
    {
      id: 'fulbert-youlou',
      name: 'Fulbert Youlou',
      role: 'Premier Président de la République',
      years: '1917 – 1972',
      bio: "Abbé et homme d'État congolais, Fulbert Youlou est la figure emblématique de l'indépendance du Congo. Chef de l'Union Démocratique de Défense des Intérêts Africains (UDDIA), il remporte les élections de 1959 et mène les négociations d'indépendance avec la France. Il devient le premier Président de la République du Congo lors de la proclamation du 15 août 1960. Son gouvernement est renversé lors des « Trois Glorieuses » en août 1963. Personnage controversé, il reste une figure incontournable de l'histoire congolaise moderne.",
      image: '/congo_monument.png',
      media: [
        { type: 'image', src: '/congo_monument.png', caption: 'Monument de l\'Indépendance, Brazzaville' },
        { type: 'video', src: 'dQw4w9WgXcQ', caption: 'Discours historique de l\'indépendance (archive)' },
      ]
    },
    {
      id: 'jean-felix-tchicaya',
      name: 'Jean-Félix Tchicaya',
      role: 'Père fondateur & Premier parlementaire',
      years: '1903 – 1961',
      bio: "Jean-Félix Tchicaya is considered as one of the founding fathers of the Republic of Congo. He is the first MP of Moyen-Congo to be elected to the French Parliament in 1946, representing the Congolese voice way before independence. As the founder of the Parti Progressiste Congolais (PPC), he played a major role in the political awakening of the Congolese people.",
      image: '/images/home/hero.webp',
      media: [
        { type: 'image', src: '/images/home/hero.webp', caption: 'Archives historiques du Congo' },
        { type: 'video', src: 'dQw4w9WgXcQ', caption: 'Témoignages sur Jean-Félix Tchicaya' },
      ]
    },
    {
      id: 'alphonse-massamba-debat',
      name: 'Alphonse Massamba-Débat',
      role: '2ème Président de la République',
      years: '1921 – 1977',
      bio: "Teacher by training and Congolese statesman, Alphonse Massamba-Débat succeeded Fulbert Youlou after the Three Glorious Days of August 1963. His rule was a major ideological shift with the adoption of scientific socialism as the state doctrine. His rule ended in 1968.",
      image: '/images/home/jeunes-congolais.webp',
      media: [
        { type: 'image', src: '/images/home/jeunes-congolais.webp', caption: 'Jeunesse congolaise des années 60' },
        { type: 'video', src: 'dQw4w9WgXcQ', caption: 'Le Congo socialiste - archives' },
      ]
    },
    {
      id: 'marien-ngouabi',
      name: 'Marien Ngouabi',
      role: '3ème Président – Fondateur du PCT',
      years: '1938 – 1977',
      bio: "Officer of the army and statesman, Commandant Marien Ngouabi took power in 1968. He established the People's Republic of the Congo, the first Marxist-Leninist state in Sub-Saharan Africa, and founded the PCT. He was assassinated on March 18, 1977. His legacy remains central in Congolese history.",
      image: '/congo_monument.png',
      media: [
        { type: 'image', src: '/congo_monument.png', caption: 'Mémorial Marien Ngouabi, Brazzaville' },
        { type: 'video', src: 'dQw4w9WgXcQ', caption: 'Hommage à Marien Ngouabi' },
      ]
    },
    {
      id: 'jacques-opangault',
      name: 'Jacques Opangault',
      role: 'Pionnier politique & Premier Ministre',
      years: '1907 – 1978',
      bio: "Major political figure of the 1950s and 60s, Jacques Opangault founded the MSA and was the main rival of Fulbert Youlou. As leader of the Moyen-Congo government, he played a key role in the pre-independence talks.",
      image: '/images/home/hero.webp',
      media: [
        { type: 'image', src: '/images/home/hero.webp', caption: 'Archives du Moyen-Congo' },
      ]
    },
    {
      id: 'pascal-lissouba',
      name: 'Pascal Lissouba',
      role: 'Premier Ministre & Président de la République',
      years: '1931 – 2020',
      bio: "Agronomist and statesman, Pascal Lissouba served as PM and was elected President in 1992 during the first free multi-party elections in Congo. His term was marked by democratic transition and civil conflicts.",
      image: '/images/home/jeunes-congolais.webp',
      media: [
        { type: 'image', src: '/images/home/jeunes-congolais.webp', caption: 'Élections présidentielles de 1992' },
        { type: 'video', src: 'dQw4w9WgXcQ', caption: 'La transition démocratique au Congo' },
      ]
    },
  ];

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
