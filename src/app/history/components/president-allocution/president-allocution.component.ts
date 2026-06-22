import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-president-allocution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './president-allocution.component.html',
  styleUrl: './president-allocution.component.scss'
})
export class PresidentAllocutionComponent {
  presidentVideoId = 'dQw4w9WgXcQ';

  constructor(private sanitizer: DomSanitizer) {}

  getSafeYoutubeUrl(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
    );
  }
}
