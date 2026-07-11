import { Injectable } from '@angular/core';

export interface ComposedImageData {
  dataUrl: string;
  fileName: string;
}

export interface ComposeOptions {
  photoDataUrl: string;
  firstName: string;
  message: string;
  location: string;
  /** Ordinal position of the participation (e.g. 142 → "142ème flamme") */
  flameNumber: number;
  /** Website URL displayed as a soft invitation (e.g. "congo15aout.cg") */
  siteUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ImageComposerService {

  /**
   * Compose the participation card canvas from user data.
   * Returns a PNG data URL at 1080×1080 px.
   */
  async compose(options: ComposeOptions): Promise<ComposedImageData> {
    const siteUrl = options.siteUrl ?? 'https://celebratecongo.com/';

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const size = 1080;
        canvas.width = size;
        canvas.height = size;

        // ── 1. Photo (cover-fit in square) ──────────────────────────
        const scale = Math.max(size / img.width, size / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);

        // ── 2. Gradient haut clair → bas sombre ─────────────────────
        const grad = ctx.createLinearGradient(0, 0, 0, size);
        grad.addColorStop(0, 'rgba(0,0,0,0.08)');
        grad.addColorStop(0.28, 'rgba(0,0,0,0.18)');
        grad.addColorStop(0.55, 'rgba(0,0,0,0.55)');
        grad.addColorStop(1, 'rgba(0,0,0,0.90)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // ── 3. Drapeau — bandeau top tricolore ──────────────────────
        const stripeH = 14;
        const sw = size / 3;
        ctx.fillStyle = '#009543'; ctx.fillRect(0, 0, sw, stripeH);
        ctx.fillStyle = '#ffde00'; ctx.fillRect(sw, 0, sw, stripeH);
        ctx.fillStyle = '#d52b1e'; ctx.fillRect(sw * 2, 0, sw, stripeH);

        // ── 4. Badge compteur — coin haut droit (generous padding) ──
        const badgeLabel = `🔥 ${this._ordinal(options.flameNumber)} flamme`;
        const badgeFontSize = 22;
        const badgeFont = `bold ${badgeFontSize}px Arial, sans-serif`;
        ctx.save();
        ctx.font = badgeFont;
        const badgeTW = ctx.measureText(badgeLabel).width;
        const badgePadX = 28; // generous left/right padding
        const badgePadY = 12;
        const badgeW = badgeTW + badgePadX * 2;
        const badgeH = badgeFontSize + badgePadY * 2;
        const badgeR = badgeH / 2; // fully pill-shaped
        const bx = size - badgeW - 24;
        const by = stripeH + 16;

        ctx.beginPath();
        ctx.roundRect(bx, by, badgeW, badgeH, badgeR);
        ctx.fillStyle = 'rgba(0,0,0,0.42)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,226,89,0.40)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffe259';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeLabel, bx + badgeW / 2, by + badgeH / 2);
        ctx.restore();

        // ── 5. Prénom seul (no last name on canvas) ──────────────────
        ctx.save();
        ctx.font = "bold 60px 'Arial', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#ffe259';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 2;
        ctx.fillText(options.firstName, size / 2, size - 290);
        ctx.restore();

        // ── 6. Localisation — sous le prénom, sans icône ────────────
        ctx.save();
        ctx.font = "500 26px 'Arial', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = 'rgba(255,255,255,0.52)';
        ctx.fillText(options.location, size / 2, size - 250);
        ctx.restore();

        // ── 7. Message centré (italic, wrapped) ─────────────────────
        ctx.save();
        ctx.font = "italic 33px 'Georgia', serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = 'rgba(255,255,255,0.90)';
        ctx.shadowBlur = 6;
        this._wrapText(ctx, `« ${options.message} »`, size / 2, size - 190, size - 120, 46);
        ctx.restore();

        // ── 8. Hashtag pills avec bordure blanche arrondie ───────────
        const tags = ['#Congo15Août', '#UnionNationale', '#JallumeMaFlamme'];
        const tagFont = "500 17px 'Arial', sans-serif";
        const tagPadX = 18;
        const tagPadY = 8;
        const tagH = 17 + tagPadY * 2;
        const tagGap = 16;
        const tagY = size - 90;

        ctx.save();
        ctx.font = tagFont;
        const tagWidths = tags.map(t => ctx.measureText(t).width);
        let totalTagW = tagWidths.reduce((sum, w) => sum + w + tagPadX * 2, 0);
        totalTagW += tagGap * (tags.length - 1);

        let tx = (size - totalTagW) / 2;
        tags.forEach((tag, i) => {
          const pw = tagWidths[i] + tagPadX * 2;
          const px = tx;
          const py = tagY - tagH / 2;

          ctx.beginPath();
          ctx.roundRect(px, py, pw, tagH, tagH / 2);
          ctx.fillStyle = 'rgba(0,0,0,0)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.25)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tag, px + pw / 2, tagY);

          tx += pw + tagGap;
        });
        ctx.restore();

        // ── 9. Invitation — une seule ligne, texte splitté ──────────
        ctx.save();
        ctx.textBaseline = 'alphabetic';
        const lineY = size - 36;

        const prefixText = 'Toi aussi, allume ta flamme sur ';
        const prefixFont = "400 20px 'Arial', sans-serif";
        const urlFont = "700 20px 'Arial', sans-serif";

        ctx.font = prefixFont;
        const prefixW = ctx.measureText(prefixText).width;
        ctx.font = urlFont;
        const urlW = ctx.measureText(siteUrl).width;
        const totalW = prefixW + urlW;
        const startX = (size - totalW) / 2;

        // Fine separator
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(size / 2 - 160, lineY - 22);
        ctx.lineTo(size / 2 + 160, lineY - 22);
        ctx.stroke();

        ctx.font = prefixFont;
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255,255,255,0.32)';
        ctx.fillText(prefixText, startX, lineY);

        ctx.font = urlFont;
        ctx.fillStyle = 'rgba(255,226,89,0.60)';
        ctx.fillText(siteUrl, startX + prefixW, lineY);
        ctx.restore();


        // Resolve
        const dataUrl = canvas.toDataURL('image/png');
        resolve({
          dataUrl,
          fileName: `flamme-congo-${options.firstName.toLowerCase().replace(/\s+/g, '-')}.png`,
        });
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = options.photoDataUrl;
    });
  }

  /** Return French ordinal: 1 → "1ère", N → "Nème" */
  private _ordinal(n: number): string {
    return n === 1 ? '1ère' : `${n}ème`;
  }

  /** Word-wrap text centred at (x, y) within maxWidth */
  private _wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      if (ctx.measureText(testLine).width > maxWidth && i > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[i] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
  }
}
