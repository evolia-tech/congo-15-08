import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './share-modal.component.html',
  styleUrl: './share-modal.component.scss'
})
export class ShareModalComponent implements OnInit {
  @Input() imageDataUrl: string = '';
  @Input() fileName: string = 'flamme-congo.png';
  @Input() firstName: string = '';
  @Input() message: string = '';
  @Output() closed = new EventEmitter<void>();

  isVisible = false;

  ngOnInit(): void {
    // Delay to trigger the transition animation
    setTimeout(() => (this.isVisible = true), 10);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.isVisible = false;
    document.body.style.overflow = '';
    setTimeout(() => this.closed.emit(), 300);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  download(): void {
    const link = document.createElement('a');
    link.href = this.imageDataUrl;
    link.download = this.fileName;
    link.click();
  }

  shareOnFacebook(): void {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`J'allume ma flamme pour le Congo ! 🔥🇨🇬 #Congo15Août #UnionNationale`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank', 'width=600,height=400');
  }

  shareOnTwitter(): void {
    const text = encodeURIComponent(`J'allume ma flamme pour l'unité nationale du Congo ! 🔥🇨🇬\n\n#Congo15Août #UnionNationale #JallumeМаFlamme`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
  }

  shareOnWhatsApp(): void {
    const text = encodeURIComponent(`J'allume ma flamme pour le Congo ! 🔥🇨🇬 Rejoignez le mouvement : ${window.location.href} #Congo15Août`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }
}
