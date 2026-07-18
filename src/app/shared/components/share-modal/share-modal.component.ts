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

  async shareNative(): Promise<void> {
    const profile = this.activeProfile;
    if (!profile) return;

    if (navigator.share) {
      try {
        const siteUrl = 'https://celebratecongo.com/participer';
        const text = `🔥🇨🇬 J'allume ma flamme pour le Congo !\n\n${profile.firstName} a rejoint l'élan national du 15 Août.\n\nRejoins-nous toi aussi 👉 ${siteUrl}\n\n#Congo15Août #JallumeMaFlamme`;

        // Si l'appareil supporte le partage de fichier (comme les smartphones)
        if (navigator.canShare) {
          const res = await fetch(profile.dataUrl);
          const blob = await res.blob();
          const file = new File([blob], `flamme-congo.png`, { type: 'image/png' });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Ma flamme pour le Congo',
              text: text
            });
            return;
          }
        }
        
        // Fallback sans le fichier si l'appareil ne supporte pas l'image
        await navigator.share({
          title: 'Ma flamme pour le Congo',
          text: text,
          url: profile.cardUrl || siteUrl
        });

      } catch (error) {
        console.error('Erreur lors du partage natif:', error);
      }
    } else {
      alert("Le partage direct d'image n'est pas supporté par votre navigateur. Vous pouvez télécharger l'image puis l'envoyer.");
    }
  }

  /** Builds the Open Graph page URL for a given participation. */
  private buildOgUrl(profile: CachedParticipation): string {
    // The API endpoint that returns the HTML page with Open Graph meta tags.
    // WhatsApp/Facebook/Twitter will crawl this page and read the og:image tag
    // to show a rich card preview with the actual participation image.
    const apiBase = 'https://api.celebratecongo.com/api';
    return `${apiBase}/participations/${profile.id}/og`;
  }

  shareOnFacebook(): void {
    const profile = this.activeProfile;
    if (!profile) return;
    const ogUrl = encodeURIComponent(this.buildOgUrl(profile));
    const text = encodeURIComponent(`J'allume ma flamme pour le Congo ! 🔥🇨🇬 #Congo15Août #UnionNationale`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${ogUrl}&quote=${text}`, '_blank', 'width=600,height=400');
  }

  shareOnTwitter(): void {
    const profile = this.activeProfile;
    if (!profile) return;
    const ogUrl = encodeURIComponent(this.buildOgUrl(profile));
    const text = encodeURIComponent(`J'allume ma flamme pour l'unité nationale du Congo ! 🔥🇨🇬\n\n#Congo15Août #UnionNationale #JallumeMaFlamme`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${ogUrl}`, '_blank', 'width=600,height=400');
  }

  shareOnWhatsApp(): void {
    const profile = this.activeProfile;
    if (!profile) return;
    const ogUrl = this.buildOgUrl(profile);
    const siteUrl = 'https://celebratecongo.com/participer';
    const text = encodeURIComponent(
      `🔥🇨🇬 J'allume ma flamme pour le Congo !\n\n` +
      `${profile.firstName} a rejoint l'élan national du 15 Août.\n\n` +
      `Rejoins-nous toi aussi et allume ta flamme ici 👉 ${siteUrl}\n\n` +
      `Découvre ma carte : ${ogUrl}\n\n` +
      `#Congo15Août #JallumeMaFlamme`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  shareOnTikTok(): void {
    window.open('https://www.tiktok.com/upload', '_blank');
  }
}
