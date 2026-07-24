import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/settings`;

  getLiveVideoUrl(): Observable<{ value: string | null }> {
    return this.http.get<{ value: string | null }>(`${this.apiUrl}/live-video-url`);
  }
}
