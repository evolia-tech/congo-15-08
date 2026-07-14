import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

type PageState = 'loading' | 'success' | 'error' | 'invalid';

@Component({
  selector: 'app-unsubscribe',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './unsubscribe.html',
  styleUrl: './unsubscribe.scss',
})
export class UnsubscribeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  public state = signal<PageState>('loading');
  public errorMessage = signal<string>('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.state.set('invalid');
      return;
    }

    this.http
      .get(`${environment.apiUrl}/newsletter/unsubscribe?token=${token}`)
      .subscribe({
        next: () => this.state.set('success'),
        error: (err) => {
          const msg = err?.error?.message ?? 'Lien invalide ou déjà utilisé.';
          this.errorMessage.set(msg);
          this.state.set('error');
        },
      });
  }
}
