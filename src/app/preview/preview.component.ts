import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss',
})
export class PreviewComponent implements OnInit, AfterViewInit {
  // Inputs
  public cardBgColor: string = '#ffffff';
  public userName: string = 'Sophie Bennett';
  public userMessage: string = "Patriote engagée qui allume sa flamme pour l'unité nationale du Congo.";
  
  // Fixed parameters
  public readonly flameNumber: number = 9;
  public readonly location: string = 'Citoyen, Brazzaville';

  // Drag & drop state
  public isDragOver: boolean = false;
  public selectedImageSrc: string | null = null;
  public isImageLoaded: boolean = false;
  private profileImage: HTMLImageElement | null = null;

  ngOnInit(): void {
    // Load default placeholder image so cards aren't empty at first
    this._loadDefaultPlaceholder();
  }

  ngAfterViewInit(): void {
    if (this.isImageLoaded) {
      this.drawBothCards();
    }
  }

  // ── File Upload / Drag & Drop ─────────────────────────────────────────────

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this._processFile(input.files[0]);
    }
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this._processFile(event.dataTransfer.files[0]);
    }
  }

  private _processFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedImageSrc = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        this.profileImage = img;
        this.isImageLoaded = true;
        this.drawBothCards();
      };
      img.src = this.selectedImageSrc;
    };
    reader.readAsDataURL(file);
  }

  private _loadDefaultPlaceholder(): void {
    // Create simple circular default icon as fallback profile
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = 400;
    fallbackCanvas.height = 400;
    const fctx = fallbackCanvas.getContext('2d');
    if (fctx) {
      fctx.fillStyle = '#e5e7eb';
      fctx.fillRect(0, 0, 400, 400);
      fctx.fillStyle = '#9ca3af';
      fctx.font = '80px sans-serif';
      fctx.textAlign = 'center';
      fctx.textBaseline = 'middle';
      fctx.fillText('👤', 200, 200);
      
      const img = new Image();
      img.onload = () => {
        this.profileImage = img;
        this.isImageLoaded = true;
        this.drawBothCards();
      };
      img.src = fallbackCanvas.toDataURL();
    }
  }

  public onInputsChange(): void {
    this.drawBothCards();
  }

  // ── Previews Drawing Logic ────────────────────────────────────────────────

  public drawBothCards(): void {
    if (!this.profileImage) return;
    this._drawClassicCard();
    this._drawCelebrationCard();
  }

  private _drawClassicCard(): void {
    const canvas = document.getElementById('canvasClassic') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cardW = 680;
    const cardH = 960;
    canvas.width = 1080;
    canvas.height = 1525;

    ctx.save();
    const scale = 1080 / cardW;
    ctx.scale(scale, scale);

    const contrast = this._getContrastSettings(this.cardBgColor);
    const margin = 36;

    // Card background
    ctx.fillStyle = this.cardBgColor;
    ctx.fillRect(0, 0, cardW, cardH);

    // Card border
    ctx.strokeStyle = contrast.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, cardW, cardH);

    // [B] Dot Grid Texture
    this._drawDotGrid(ctx, cardW, cardH, contrast.isDark);

    // Photo block - zero margins, sticks to top/left/right
    const photoW = cardW;
    const photoH = 560;
    const px = 0;
    const py = 0;

    if (this.profileImage) {
      ctx.save();
      // Draw rectangular path
      ctx.beginPath();
      ctx.rect(px, py, photoW, photoH);
      ctx.clip();

      const imgScale = Math.max(photoW / this.profileImage.width, photoH / this.profileImage.height);
      const dw = this.profileImage.width * imgScale;
      const dh = this.profileImage.height * imgScale;
      const dx = px + (photoW - dw) / 2;
      const dy = py; // top-center
      ctx.drawImage(this.profileImage, dx, dy, dw, dh);

      // Tricolor bottom flag bar
      const flagH = 14;
      const flagY = py + photoH - flagH;
      const sw = photoW / 3;
      ctx.fillStyle = '#009543'; ctx.fillRect(px, flagY, sw, flagH);
      ctx.fillStyle = '#ffde00'; ctx.fillRect(px + sw, flagY, sw, flagH);
      ctx.fillStyle = '#d52b1e'; ctx.fillRect(px + sw * 2, flagY, sw, flagH);
      ctx.restore();
    }

    // Badge overlay - top right corner
    ctx.save();
    const overlayText = `🔥 ${this._ordinal(this.flameNumber)} flamme`;
    ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const overlayTextW = ctx.measureText(overlayText).width;
    const overlayW = overlayTextW + 32;
    const overlayH = 44;
    const overlayX = photoW - overlayW - 20;
    const overlayY = 20;
    ctx.beginPath();
    ctx.rect(overlayX, overlayY, overlayW, overlayH);
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

    // [C] CONGO Watermark
    this._drawWatermark(ctx, cardW, cardH, photoH, contrast.isDark);

    // Left margins content
    const contentX = margin;
    const txtBaseY = photoH + 68;

    // Prénom / Nom
    const maxNameW = cardW - margin * 2 - 60;
    let displayName = this.userName;
    ctx.save();
    ctx.font = "bold 46px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    if (ctx.measureText(displayName).width > maxNameW) {
      while (ctx.measureText(displayName + '...').width > maxNameW && displayName.length > 0) {
        displayName = displayName.slice(0, -1);
      }
      displayName += '...';
    }
    ctx.fillStyle = contrast.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(displayName, contentX, txtBaseY);

    // Green Verification Badge
    const nameW = ctx.measureText(displayName).width;
    this._drawVerifyBadge(ctx, contentX + nameW + 28, txtBaseY - 14, 34);
    ctx.restore();

    // Location (left aligned)
    this._drawLocationPin(ctx, contentX, txtBaseY + 50, contrast.muted);
    ctx.save();
    ctx.font = "normal 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = contrast.muted;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(this.location, contentX + 30, txtBaseY + 50);
    ctx.restore();

    // Message (left aligned)
    ctx.save();
    ctx.font = "normal 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = contrast.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    this._wrapText(ctx, this.userMessage, contentX, txtBaseY + 112, cardW - margin * 2, 34);
    ctx.restore();

    // Bottom CTA - Left Aligned normal wrapping
    const bottomY = cardH - 50;
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    const fullCTAText = "Toi aussi, viens célébrer le 66e anniversaire de l'indépendance du Congo en allumant ta flamme sur celebratecongo.com";
    this._drawStyledCTA(ctx, fullCTAText, contentX, bottomY, cardW - margin * 2, 24, 'celebratecongo.com',
      contrast.isDark ? '#ffe259' : '#009543', contrast.muted, false);
    ctx.restore();

    ctx.restore();
  }

  private _drawCelebrationCard(): void {
    const canvas = document.getElementById('canvasCelebration') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cardW = 680;
    const cardH = 960;
    canvas.width = 1080;
    canvas.height = 1525;

    ctx.save();
    const scale = 1080 / cardW;
    ctx.scale(scale, scale);

    const contrast = this._getContrastSettings(this.cardBgColor);
    const margin = 36;

    // Card background
    ctx.fillStyle = this.cardBgColor;
    ctx.fillRect(0, 0, cardW, cardH);

    // Card border
    ctx.strokeStyle = contrast.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, cardW, cardH);

    // [B] Dot Grid Texture
    this._drawDotGrid(ctx, cardW, cardH, contrast.isDark);

    // Photo zone wavy flag height
    const photoZoneH = 440;

    // Wavy Congo Flag Rendering
    const flagCanvas = document.createElement('canvas');
    flagCanvas.width = cardW;
    flagCanvas.height = photoZoneH + 40;
    const fctx = flagCanvas.getContext('2d');
    if (fctx) {
      // Green
      fctx.fillStyle = '#009543';
      fctx.beginPath();
      fctx.moveTo(0, 0);
      fctx.lineTo(cardW * 0.42, 0);
      fctx.lineTo(0, (photoZoneH + 40) * 0.65);
      fctx.closePath();
      fctx.fill();

      // Yellow
      fctx.fillStyle = '#ffde00';
      fctx.beginPath();
      fctx.moveTo(cardW * 0.42, 0);
      fctx.lineTo(cardW, 0);
      fctx.lineTo(cardW, (photoZoneH + 40) * 0.35);
      fctx.lineTo(cardW * 0.58, photoZoneH + 40);
      fctx.lineTo(0, photoZoneH + 40);
      fctx.lineTo(0, (photoZoneH + 40) * 0.65);
      fctx.closePath();
      fctx.fill();

      // Red
      fctx.fillStyle = '#d52b1e';
      fctx.beginPath();
      fctx.moveTo(cardW, (photoZoneH + 40) * 0.35);
      fctx.lineTo(cardW, photoZoneH + 40);
      fctx.lineTo(cardW * 0.58, photoZoneH + 40);
      fctx.closePath();
      fctx.fill();
    }

    // Render wavy columns
    ctx.save();
    const waveAmplitude = 10;
    const waveFrequency = 0.025;
    for (let sx = 0; sx < cardW; sx++) {
      const sy = Math.sin(sx * waveFrequency) * waveAmplitude;
      const shade = Math.cos(sx * waveFrequency) * 0.15;

      ctx.drawImage(flagCanvas, sx, 0, 1, photoZoneH + 40, sx, sy - 20, 1, photoZoneH + 40);

      // shading overlay
      if (shade > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${shade * 0.7})`;
      } else {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.abs(shade) * 0.7})`;
      }
      ctx.fillRect(sx, sy - 20, 1, photoZoneH + 40);
    }
    ctx.restore();

    // Circular Photo centered on the flag boundary
    if (this.profileImage) {
      const circleRadius = 170;
      const circleCX = cardW / 2;
      const circleCY = photoZoneH - 20;

      // 1. Gold ring
      const goldGrad = ctx.createLinearGradient(
        circleCX - circleRadius - 8, circleCY - circleRadius - 8,
        circleCX + circleRadius + 8, circleCY + circleRadius + 8
      );
      goldGrad.addColorStop(0, '#FFE259');
      goldGrad.addColorStop(0.5, '#FFA751');
      goldGrad.addColorStop(1, '#FFE259');
      ctx.save();
      ctx.beginPath();
      ctx.arc(circleCX, circleCY, circleRadius + 10, 0, Math.PI * 2);
      ctx.fillStyle = goldGrad;
      ctx.fill();
      ctx.restore();

      // 2. Tricolor ring segments
      const segAngle = (Math.PI * 2) / 3;
      const startAngle = -Math.PI / 2;
      const ringColors = ['#009543', '#ffde00', '#d52b1e'];
      ringColors.forEach((color, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(circleCX, circleCY, circleRadius + 5, startAngle + i * segAngle, startAngle + (i + 1) * segAngle);
        ctx.arc(circleCX, circleCY, circleRadius, startAngle + (i + 1) * segAngle, startAngle + i * segAngle, true);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      });

      // 3. Separation white ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(circleCX, circleCY, circleRadius + 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      // 4. Photo circle clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(circleCX, circleCY, circleRadius, 0, Math.PI * 2);
      ctx.clip();
      const imgScale = Math.max((circleRadius * 2) / this.profileImage.width, (circleRadius * 2) / this.profileImage.height);
      const dw = this.profileImage.width * imgScale;
      const dh = this.profileImage.height * imgScale;
      const dx = circleCX - dw / 2;
      const dy = circleCY - circleRadius; // aligned top center
      ctx.drawImage(this.profileImage, dx, dy, dw, dh);
      ctx.restore();
    }

    // Badge overlay - top right corner
    ctx.save();
    const overlayText = `🔥 ${this._ordinal(this.flameNumber)} flamme`;
    ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const overlayTextW = ctx.measureText(overlayText).width;
    const overlayW = overlayTextW + 32;
    const overlayH = 44;
    const overlayX = cardW - overlayW - 20;
    const overlayY = 20;
    ctx.beginPath();
    ctx.rect(overlayX, overlayY, overlayW, overlayH);
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

    // [C] CONGO Watermark in text zone (starts after circle overlap)
    const textZoneStartY = photoZoneH + 170;
    this._drawWatermark(ctx, cardW, cardH, textZoneStartY, contrast.isDark);

    // Text zone contents - completely centered
    const contentX = cardW / 2;
    const txtBaseY = photoZoneH + 200;

    // Prénom / Nom (Centered)
    const maxNameW = cardW - margin * 2 - 60;
    let displayName = this.userName;
    ctx.save();
    ctx.font = "bold 46px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    if (ctx.measureText(displayName).width > maxNameW) {
      while (ctx.measureText(displayName + '...').width > maxNameW && displayName.length > 0) {
        displayName = displayName.slice(0, -1);
      }
      displayName += '...';
    }
    ctx.fillStyle = contrast.text;
    ctx.fillText(displayName, contentX, txtBaseY);

    // Green Verification Badge centered relative to text
    const nameW = ctx.measureText(displayName).width;
    this._drawVerifyBadge(ctx, contentX + nameW / 2 + 20, txtBaseY - 14, 34);
    ctx.restore();

    // Location centered with vector pin
    ctx.save();
    ctx.font = "normal 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = contrast.muted;
    ctx.textBaseline = 'alphabetic';
    
    const locText = this.location;
    const textW = ctx.measureText(locText).width;
    const pinW = 20;
    const totalW = pinW + 10 + textW;
    const startX = (cardW - totalW) / 2;

    this._drawLocationPin(ctx, startX, txtBaseY + 50, contrast.muted);
    ctx.textAlign = 'left';
    ctx.fillText(locText, startX + 30, txtBaseY + 50);
    ctx.restore();

    // Message centered
    ctx.save();
    ctx.font = "normal 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillStyle = contrast.text;
    ctx.textBaseline = 'alphabetic';
    this._wrapTextCentered(ctx, this.userMessage, contentX, txtBaseY + 112, cardW - margin * 2, 34);
    ctx.restore();

    // Bottom CTA invitation - centered
    const bottomY = cardH - 58;
    ctx.save();
    const fullCTAText = "Toi aussi, viens célébrer le 66e anniversaire de l'indépendance du Congo en allumant ta flamme sur celebratecongo.com";
    this._drawStyledCTA(ctx, fullCTAText, contentX, bottomY, cardW - margin * 2, 26, 'celebratecongo.com',
      contrast.isDark ? '#ffe259' : '#009543', contrast.muted, true);
    ctx.restore();

    ctx.restore();
  }

  // ── Canvas Helpers ────────────────────────────────────────────────────────

  private _drawDotGrid(ctx: CanvasRenderingContext2D, cardW: number, cardH: number, isDark: boolean): void {
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = isDark ? '#ffffff' : '#111111';
    const spacing = 22;
    const radius = 1.5;
    for (let x = spacing / 2; x < cardW; x += spacing) {
      for (let y = spacing / 2; y < cardH; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private _drawWatermark(ctx: CanvasRenderingContext2D, cardW: number, cardH: number, startY: number, isDark: boolean): void {
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.font = `bold 180px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.fillStyle = isDark ? '#ffffff' : '#111111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const cx = cardW / 2;
    const cy = startY + (cardH - startY) / 2;
    ctx.translate(cx, cy);
    ctx.rotate(-22 * Math.PI / 180);
    ctx.fillText('CONGO', 0, 0);
    ctx.restore();
  }

  private _drawVerifyBadge(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();

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

  private _wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split(' ');
    let line = '', currentY = y;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      if (ctx.measureText(testLine).width > maxWidth && i > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[i] + ' ';
        currentY += lineHeight;
      } else { line = testLine; }
    }
    ctx.fillText(line.trim(), x, currentY);
  }

  private _wrapTextCentered(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split(' ');
    let line = '', currentY = y;
    const lines: string[] = [];
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      if (ctx.measureText(testLine).width > maxWidth && i > 0) {
        lines.push(line.trim());
        line = words[i] + ' ';
      } else { line = testLine; }
    }
    lines.push(line.trim());
    
    ctx.save();
    ctx.textAlign = 'center';
    lines.forEach(l => {
      ctx.fillText(l, x, currentY);
      currentY += lineHeight;
    });
    ctx.restore();
  }

  private _drawStyledCTA(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    urlText: string,
    urlColor: string,
    mutedColor: string,
    centered: boolean
  ): void {
    const words = text.split(' ');
    let lineWords: string[] = [];
    let currentX = 0;
    const lines: string[][] = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const isUrl = word.includes(urlText);
      ctx.font = isUrl
        ? "bold 18px -apple-system, BlinkMacSystemFont, sans-serif"
        : "normal 18px -apple-system, BlinkMacSystemFont, sans-serif";
      const wordWidth = ctx.measureText(word + ' ').width;
      
      if (currentX + wordWidth > maxWidth && lineWords.length > 0) {
        lines.push(lineWords);
        lineWords = [word];
        currentX = wordWidth;
      } else {
        lineWords.push(word);
        currentX += wordWidth;
      }
    }
    if (lineWords.length > 0) {
      lines.push(lineWords);
    }
    
    let currentY = y;
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    
    lines.forEach((line) => {
      let lineWidth = 0;
      line.forEach((w) => {
        const isUrl = w.includes(urlText);
        ctx.font = isUrl
          ? "bold 18px -apple-system, BlinkMacSystemFont, sans-serif"
          : "normal 18px -apple-system, BlinkMacSystemFont, sans-serif";
        lineWidth += ctx.measureText(w + ' ').width;
      });
      
      let startX = centered ? (x - lineWidth / 2) : x;
      line.forEach((w) => {
        const isUrl = w.includes(urlText);
        ctx.font = isUrl
          ? "bold 18px -apple-system, BlinkMacSystemFont, sans-serif"
          : "normal 18px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = isUrl ? urlColor : mutedColor;
        ctx.fillText(w, startX, currentY);
        startX += ctx.measureText(w + ' ').width;
      });
      
      currentY += lineHeight;
    });
    ctx.restore();
  }

  private _ordinal(n: number): string {
    if (n === 1) return '1ère';
    return n < 10 ? `${n}e` : `${n}ème`;
  }

  private _getContrastSettings(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (r * 299 + g * 587 + b * 114) / 1000;
    const isDark = luminance < 140;
    return {
      isDark,
      text: isDark ? '#ffffff' : '#111827',
      muted: isDark ? '#94a3b8' : '#6b7280',
      lightMuted: isDark ? '#4b5563' : '#d1d5db',
      border: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.02)'
    };
  }

  // ── Download Action ───────────────────────────────────────────────────────

  public downloadCard(style: 'classic' | 'celebration'): void {
    const canvasId = style === 'classic' ? 'canvasClassic' : 'canvasCelebration';
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `flamme-congo-${style}-${this.userName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}
