import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProgramScheduleComponent } from '../shared/components/program-schedule/program-schedule.component';
import { SettingsService } from '../shared/services/settings.service';

@Component({
  selector: 'app-live',
  standalone: true,
  templateUrl: './live.component.html',
  styleUrl: './live.component.scss',
  imports: [ProgramScheduleComponent],
})
export class LiveComponent implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private settingsService = inject(SettingsService);

  // Target statistics mock data
  flamesTotal = 742158;
  countriesCount = 195;
  todayCount = 12458;

  // Animated display values for count-up
  displayCountries = 0;
  displayToday = 0;

  // Video URL property & state flag
  videoUrl: SafeResourceUrl | null = null;
  hasVideo = false;
  isLoading = true;

  private animationFrameIds: number[] = [];


  ngOnInit(): void {
    // Trigger count-up animation for the overlay statistics
    this.animateStat('displayCountries', this.countriesCount, 2000);
    this.animateStat('displayToday', this.todayCount, 2200);

    // Fetch the live streaming link from the configuration settings API
    this.settingsService.getLiveVideoUrl().subscribe({
      next: (res) => {
        if (res.value && res.value.trim() !== '') {
          this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.value.trim());
          this.hasVideo = true;
        } else {
          this.videoUrl = null;
          this.hasVideo = false;
        }
        this.isLoading = false;
      },
      error: () => {
        // Fallback to false if the API fails
        this.videoUrl = null;
        this.hasVideo = false;
        this.isLoading = false;
      }
    });
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
