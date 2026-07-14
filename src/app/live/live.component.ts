import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProgramScheduleComponent } from '../shared/components/program-schedule/program-schedule.component';

@Component({
  selector: 'app-live',
  standalone: true,
  templateUrl: './live.component.html',
  styleUrl: './live.component.scss',
  imports: [ProgramScheduleComponent],
})
export class LiveComponent implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);

  // Target statistics mock data
  flamesTotal = 742158;
  countriesCount = 195;
  todayCount = 12458;

  // Animated display values for count-up
  displayCountries = 0;
  displayToday = 0;

  // Sanitized YouTube URL placeholder for live stream
  videoUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&rel=0&modestbranding=1'
  );

  private animationFrameIds: number[] = [];

  ngOnInit(): void {
    // Trigger count-up animation for the overlay statistics
    this.animateStat('displayCountries', this.countriesCount, 2000);
    this.animateStat('displayToday', this.todayCount, 2200);
  }

  ngOnDestroy(): void {
    // Clean up animation frames on component destruction
    this.animationFrameIds.forEach((id) => cancelAnimationFrame(id));
  }

  private animateStat(key: 'displayCountries' | 'displayToday', end: number, duration: number): void {
    const startTime = performance.now();
    const start = 0;

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Cubic ease-out curve for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      this[key] = Math.floor(start + easeProgress * (end - start));

      if (progress < 1) {
        const id = requestAnimationFrame(step);
        this.animationFrameIds.push(id);
      } else {
        this[key] = end;
      }
    };

    const initialId = requestAnimationFrame(step);
    this.animationFrameIds.push(initialId);
  }
}
