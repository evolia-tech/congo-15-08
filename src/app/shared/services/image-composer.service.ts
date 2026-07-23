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
  /** Optional background color hex (defaults to #ffffff) */
  cardBgColor?: string;
}

@Injectable({ providedIn: 'root' })
export class ImageComposerService {

  /**
   * Compose the participation card canvas from user data based on the minimalist profile design.
   * Returns a PNG data URL at 1080×1080 px.
   */
  async compose(options: ComposeOptions): Promise<ComposedImageData> {
    const siteUrl = options.siteUrl ?? 'https://celebratecongo.com';
    const cardBgColor = options.cardBgColor ?? '#ffffff';

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const cardW = 680;
        const cardH = 960;
        const targetWidth = 1080;
        const targetHeight = 1525; // 1080 * (960 / 680) = 1524.7px -> 1525px
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Scale context so we can keep using the 680x960 grid coordinates
        const scale = targetWidth / cardW;
        ctx.scale(scale, scale);

        const contrast = this._getContrastSettings(cardBgColor);

        // ── 1. Card Shape Clip (Standard Rectangle with margins/zero rounding) ───
        const cardX = 0;
        const cardY = 0;
        const cardR = 0; // No border radius

        ctx.save();
        this._drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
        ctx.clip();

        // ── 2. Card Background ──────────────────────────────────────────
        ctx.fillStyle = cardBgColor;
        ctx.fillRect(cardX, cardY, cardW, cardH);

        // Card border (subtle edge line)
        ctx.strokeStyle = contrast.border;
        ctx.lineWidth = 2;
        ctx.stroke();

        // ── [B] Micro-texture de points sur le fond ─────────────────────
        ctx.save();
        ctx.globalAlpha = 0.05; // 5% d'opacité : imperceptible sauf à y regarder de près
        ctx.fillStyle = contrast.isDark ? '#ffffff' : '#111111';
        const dotSpacing = 22;
        const dotRadius = 1.5;
        for (let dotX = cardX + dotSpacing / 2; dotX < cardX + cardW; dotX += dotSpacing) {
          for (let dotY = cardY + dotSpacing / 2; dotY < cardY + cardH; dotY += dotSpacing) {
            ctx.beginPath();
            ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        // ── 3. Photo Section (Full width at the top, sticks to edges) ────
        const margin = 36;
        const photoW = cardW;
        const photoHeightValue = 560;
        const px = cardX;
        const py = cardY;
        const pr = 0; // No border radius

        ctx.save();
        this._drawPhotoRect(ctx, px, py, photoW, photoHeightValue, pr);
        ctx.clip();

        // Cover-fit logic (top center alignment)
        const imgScale = Math.max(photoW / img.width, photoHeightValue / img.height);
        const dw = img.width * imgScale;
        const dh = img.height * imgScale;
        const dx = px + (photoW - dw) / 2;
        const dy = py; // Stretches from the top of the photo block
        ctx.drawImage(img, dx, dy, dw, dh);
        
        // Thicker tricolor flag bar at the bottom edge of the photo
        const flagH = 14;
        const flagY = py + photoHeightValue - flagH;
        const sw = photoW / 3;
        ctx.fillStyle = '#009543'; ctx.fillRect(px, flagY, sw, flagH);
        ctx.fillStyle = '#ffde00'; ctx.fillRect(px + sw, flagY, sw, flagH);
        ctx.fillStyle = '#d52b1e'; ctx.fillRect(px + sw * 2, flagY, sw, flagH);
        
        ctx.restore();

        // ── 4. Flame Number Overlay in top-right corner of the photo ─────
        ctx.save();
        const overlayText = `🔥 ${this._ordinal(options.flameNumber)} flamme`;
        ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        const overlayTextW = ctx.measureText(overlayText).width;
        const overlayW = overlayTextW + 32;
        const overlayH = 44;
        const overlayX = px + photoW - overlayW - 20;
        const overlayY = py + 20;
        
        this._drawRoundedRect(ctx, overlayX, overlayY, overlayW, overlayH, 0); // No border radius
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(overlayText, overlayX + overlayW / 2, overlayY + overlayH / 2);
        ctx.restore();

        // ── 5. Card Content (Bottom part) ────────────────────────────────────
        const contentX = cardX + margin;
        const txtBaseY = py + photoHeightValue + 68;

        // ── [C] Filigrane « CONGO » en arrière-plan de la zone texte ──
        ctx.save();
        ctx.globalAlpha = 0.04; // 4% d'opacité : très discret
        ctx.font = `bold 180px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        ctx.fillStyle = contrast.isDark ? '#ffffff' : '#111111';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Centrer dans la zone de texte
        const textZoneCenterX = cardW / 2;
        const textZoneCenterY = py + photoHeightValue + (cardH - py - photoHeightValue) / 2;
        ctx.save();
        ctx.translate(textZoneCenterX, textZoneCenterY);
        ctx.rotate(-22 * Math.PI / 180); // Inclinaison -22°
        ctx.fillText('CONGO', 0, 0);
        ctx.restore();
        ctx.globalAlpha = 1; // Réinitialise l'opacité
        ctx.restore();

        // Limit name length to prevent overlap with the verification badge
        const maxNameW = cardW - margin * 2 - 60;
        let displayName = options.firstName;
        ctx.save();
        ctx.font = "bold 46px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

        if (ctx.measureText(displayName).width > maxNameW) {
          while (ctx.measureText(displayName + '...').width > maxNameW && displayName.length > 0) {
            displayName = displayName.slice(0, -1);
          }
          displayName = displayName + '...';
        }

        // Couleur normale du texte (selon le contraste du fond)
        ctx.fillStyle = contrast.text;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(displayName, contentX, txtBaseY);

        // Green Verification Badge
        const nameW = ctx.measureText(displayName).width;
        this._drawVerifyBadge(ctx, contentX + nameW + 28, txtBaseY - 14, 34);
        ctx.restore();

        // Location (With Location Pin Icon)
        this._drawLocationPin(ctx, contentX, txtBaseY + 46, contrast.muted);
        ctx.save();
        ctx.font = "normal 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillStyle = contrast.muted;
        ctx.fillText(options.location, contentX + 30, txtBaseY + 46);
        ctx.restore();

        // Message (takes full card width)
        ctx.save();
        ctx.font = "normal 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillStyle = contrast.text;
        this._wrapText(ctx, options.message, contentX, txtBaseY + 104, cardW - margin * 2, 34);
        ctx.restore();

        // ── 6. Bottom Row: Clean text invitation CTA with dynamic normal wrapping ──
        const bottomY = cardY + cardH - 50; // Y baseline of the first line (adjusted for 16px font and 24px line height)
        ctx.save();
        ctx.textBaseline = 'alphabetic'; // Standard baseline for consistent font drawing
        ctx.textAlign = 'left';
        
        const fullCTAText = "Toi aussi, viens célébrer le 66e anniversaire de l'indépendance du Congo en allumant ta flamme sur celebratecongo.com";
        const urlHighlight = "celebratecongo.com";
        const brandColor = contrast.isDark ? '#ffe259' : '#009543';

        this._drawStyledCTA(
          ctx,
          fullCTAText,
          contentX,
          bottomY,
          cardW - margin * 2,
          24, // Line height
          urlHighlight,
          brandColor,
          contrast.muted
        );
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

  /** Helper to draw photo rect (top corners rounded, bottom corners flat) */
  private _drawPhotoRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, [radius, radius, 0, 0]);
    ctx.closePath();
  }

  /** Helper for drawing rounded rect */
  private _drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.closePath();
  }

  /** Helper to draw location pin (simple outlined map pin) */
  private _drawLocationPin(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const pinRadius = 7;
    ctx.beginPath();
    ctx.arc(x + 10, y - 12, pinRadius, 0, Math.PI * 2);
    ctx.moveTo(x + 10 - pinRadius, y - 12);
    ctx.lineTo(x + 10, y + 2);
    ctx.lineTo(x + 10 + pinRadius, y - 12);
    ctx.stroke();
    ctx.restore();
  }

  /** Draw verification badge icon */
  private _drawVerifyBadge(ctx: CanvasRenderingContext2D, x: number, y: number, size: number = 34): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();

    // Checkmark path inside badge
    ctx.beginPath();
    ctx.moveTo(x - size * 0.18, y + size * 0.02);
    ctx.lineTo(x - size * 0.05, y + size * 0.15);
    ctx.lineTo(x + size * 0.2, y - 12);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }

  /** Helper to check luminance and adapt text color */
  private _getContrastSettings(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (r * 299 + g * 587 + b * 114) / 1000;
    
    const isDark = luminance < 140;
    return {
      isDark: isDark,
      text: isDark ? '#ffffff' : '#111827',
      muted: isDark ? '#94a3b8' : '#6b7280',
      lightMuted: isDark ? '#4b5563' : '#d1d5db',
      btnBg: isDark ? 'rgba(255, 255, 255, 0.15)' : '#f3f4f6',
      btnText: isDark ? '#ffffff' : '#111827',
      border: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.02)'
    };
  }

  /** Word-wrap text left-aligned at (x, y) within maxWidth */
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

  /** Render a styled string wrapping normally with URL highlighting */
  private _drawStyledCTA(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    urlText: string,
    urlColor: string,
    mutedColor: string
  ): void {
    const words = text.split(' ');
    let currentX = x;
    let currentY = y;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const isUrl = word.includes(urlText);
      
      ctx.font = isUrl 
        ? "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        : "normal 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = isUrl ? urlColor : mutedColor;
        
      const wordWidth = ctx.measureText(word + ' ').width;
      
      if (currentX + wordWidth > x + maxWidth && i > 0) {
        currentX = x;
        currentY += lineHeight;
      }
      
      ctx.fillText(word, currentX, currentY);
      currentX += wordWidth;
    }
  }

  /** Return French ordinal: 1 → "1ère", single digit → "Ne", multi-digit → "Nème" */
  private _ordinal(n: number): string {
    if (n === 1) return '1ère';
    return n < 10 ? `${n}e` : `${n}ème`;
  }
}
