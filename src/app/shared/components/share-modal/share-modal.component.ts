import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipationService, CachedParticipation } from '../../services/participation.service';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-share-modal',
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './share-modal.component.html',
  styleUrl: './share-modal.component.scss'
})
export class ShareModalComponent implements OnInit {
  /** Drives the CSS closing animation. Opening is handled by CSS @keyframes. */
  isClosing = false;

  constructor(public participationService: ParticipationService) { }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  get profiles(): CachedParticipation[] {
    return this.participationService.localParticipations();
  }

  get activeProfile(): CachedParticipation | null {
    const list = this.profiles;
    const activeId = this.participationService.activeParticipationId();
    if (!activeId && list.length > 0) {
      return list[list.length - 1];
    }
    return list.find(x => x.id === activeId) || (list.length > 0 ? list[0] : null);
  }

  selectProfile(id: string): void {
    this.participationService.openShareModal(id);
  }

  close(): void {
    this.isClosing = true;
    document.body.style.overflow = '';
    // Wait for the CSS closing animation to finish before removing from DOM
    setTimeout(() => this.participationService.closeShareModal(), 280);
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.isClosing) return;
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  download(): void {
    const profile = this.activeProfile;
    if (!profile) return;
    const link = document.createElement('a');
    link.href = profile.dataUrl;
    link.download = `flamme-congo-${profile.firstName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
  }

  shareOnFacebook(): void {
    const profile = this.activeProfile;
    if (!profile) return;
    const shareUrl = profile.cardUrl || window.location.origin;
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(`J'allume ma flamme pour le Congo ! 🔥🇨🇬 #Congo15Août #UnionNationale`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank', 'width=600,height=400');
  }

  shareOnTwitter(): void {
    const profile = this.activeProfile;
    if (!profile) return;
    const shareUrl = profile.cardUrl || window.location.origin;
    const text = encodeURIComponent(`J'allume ma flamme pour l'unité nationale du Congo ! 🔥🇨🇬\n\n#Congo15Août #UnionNationale #JallumeMaFlamme`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
  }

  shareOnWhatsApp(): void {
    const profile = this.activeProfile;
    if (!profile) return;
    const shareUrl = profile.cardUrl || window.location.origin;
    const text = encodeURIComponent(`J'allume ma flamme pour le Congo ! 🔥🇨🇬 Découvre ma carte : ${shareUrl} #Congo15Août`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  shareOnTikTok(): void {
    window.open('https://www.tiktok.com/upload', '_blank');
  }
}
