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
}

@Injectable({ providedIn: 'root' })
export class ImageComposerService {

  /**
   * Compose the user's photo with an overlay that includes their message,
   * name and Congo branding. Returns a PNG data URL.
   */
  async compose(options: ComposeOptions): Promise<ComposedImageData> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        // Square canvas — good for social sharing
        const size = 1080;
        canvas.width = size;
        canvas.height = size;

        // --- 1. Draw user photo (cover-fit in square) ---
        const scale = Math.max(size / img.width, size / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const offsetX = (size - drawW) / 2;
        const offsetY = (size - drawH) / 2;
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

        // --- 2. Dark gradient overlay (bottom heavy) ---
        const grad = ctx.createLinearGradient(0, 0, 0, size);
        grad.addColorStop(0, 'rgba(0,0,0,0.05)');
        grad.addColorStop(0.45, 'rgba(0,0,0,0.15)');
        grad.addColorStop(1, 'rgba(0,0,0,0.78)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // --- 3. Congo flag stripe (top, thin) ---
        const stripeH = 12;
        const stripeW = size / 3;
        ctx.fillStyle = '#009543'; // green
        ctx.fillRect(0, 0, stripeW, stripeH);
        ctx.fillStyle = '#ffde00'; // yellow
        ctx.fillRect(stripeW, 0, stripeW, stripeH);
        ctx.fillStyle = '#d52b1e'; // red
        ctx.fillRect(stripeW * 2, 0, stripeW, stripeH);

        // --- 4. Flame emoji decoration ---
        ctx.font = 'bold 64px serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffe259';
        ctx.shadowColor = 'rgba(255, 226, 89, 0.6)';
        ctx.shadowBlur = 20;
        ctx.fillText('🔥', size / 2, size - 340);
        ctx.shadowBlur = 0;

        // --- 5. User's name ---
        ctx.font = `bold 52px 'Arial', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffe259';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 2;
        ctx.fillText(options.firstName, size / 2, size - 262);

        // --- 6. Message text (wrapped) ---
        ctx.font = `italic 34px 'Georgia', serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.shadowBlur = 8;
        this._wrapText(ctx, `"${options.message}"`, size / 2, size - 195, size - 120, 44);

        // --- 7. Location tag ---
        ctx.font = `500 26px 'Arial', sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.shadowBlur = 0;
        ctx.fillText(`📍 ${options.location}`, size / 2, size - 128);

        // --- 8. Project tagline + hashtag ---
        ctx.font = `bold 22px 'Arial', sans-serif`;
        ctx.fillStyle = 'rgba(255, 226, 89, 0.9)';
        ctx.fillText('CONGO 15 AOÛT — J\'allume ma flamme 🇨🇬', size / 2, size - 76);

        ctx.font = `18px 'Arial', sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('#Congo15Août #UnionNationale #JallumeМаFlamme', size / 2, size - 46);

        // Done
        const dataUrl = canvas.toDataURL('image/png');
        resolve({
          dataUrl,
          fileName: `flamme-congo-${options.firstName.toLowerCase().replace(/\s+/g, '-')}.png`
        });
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = options.photoDataUrl;
    });
  }

  /** Wrap text to fit within maxWidth */
  private _wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
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
