import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

export interface ParticipationPayload {
  firstName: string;
  email: string;
  countryId: string;
  department?: string;
  message: string;
  card: File;
}

export interface ParticipationResponse {
  id: string;
  firstName: string;
  email: string;
  countryId: string;
  department?: string;
  message: string;
  cardUrl: string;
  isApproved: boolean;
  createdAt: string;
}

export interface CachedParticipation {
  id: string;
  firstName: string;
  location: string;
  cardUrl: string | null;
  dataUrl: string;
  message: string;
}

export interface ParticipationStats {
  totalParticipations: number;
  departmentsParticipated: number;
  diasporaCountries: number;
  localParticipations: number;
  departments?: { name: string; count: number }[];
  countries?: { countryId: string; count: number }[];
}

/** Lightweight shape used for the public message wall */
export interface ParticipationMessage {
  id: string;
  firstName: string;
  location: string;  // country or department label
  message: string;
  createdAt: string;
}

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_STATS: ParticipationStats = {
  totalParticipations: 0,
  departmentsParticipated: 0,
  diasporaCountries: 0,
  localParticipations: 0,
};

const LOCATIONS = [
  'Brazzaville', 'Pointe-Noire', 'Dolisie', 'Paris', 'Lyon', 'Bordeaux',
  'Marseille', 'Montpellier', 'Libreville', 'Kinshasa', 'Dakar',
  'Abidjan', 'Douala', 'Yaoundé', 'Montréal', 'Bruxelles', 'Londres',
  'New York', 'Nkayi', 'Ouesso', 'Impfondo',
];

const FIRST_NAMES = [
  'Jean-Pierre', 'Marie', 'Christelle', 'Patrick', 'Sandrine', 'Alexis',
  'Céleste', 'Emmanuel', 'Grâce', 'Roland', 'Patience', 'Théophile',
  'Aurore', 'Fidèle', 'Claudine', 'Aristide', 'Joëlle', 'Franck',
  'Béatrice', 'Gérard', 'Nathalie', 'Sylvain',
];

const MESSAGES = [
  'Vive le Congo uni et fort ! Ma flamme brûle pour chaque Congolais.',
  'Je suis fier de participer à ce moment historique pour notre nation.',
  'Ensemble, nous construisons un avenir meilleur pour nos enfants.',
  'La flamme de l\'unité brûle dans mon cœur, où que je sois.',
  'Ce geste symbolique nous rappelle que nous sommes un seul peuple.',
  'Pour les générations futures, je dépose ma flamme avec amour.',
  'Le Congo a besoin de chacun de nous. Allumez votre flamme !',
  'Depuis la diaspora, mon cœur est toujours au Congo.',
  'Un pays, un peuple, une flamme !',
  'Je participe avec fierté et émotion à cet élan national.',
  'La flamme de la paix brûle pour tous les Congolais du monde.',
  'Nous sommes plus forts ensemble. Vive l\'unité nationale !',
];

function generateMockMessages(count: number, offset: number): ParticipationMessage[] {
  return Array.from({ length: count }, (_, i) => {
    const idx = offset + i;
    return {
      id: `mock-${idx}`,
      firstName: FIRST_NAMES[idx % FIRST_NAMES.length],
      location: LOCATIONS[idx % LOCATIONS.length],
      message: MESSAGES[idx % MESSAGES.length],
      createdAt: new Date(Date.now() - idx * 3600_000).toISOString(),
    };
  });
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class ParticipationService {
  private readonly apiUrl = `${environment.apiUrl}/participations`;
  private readonly PAGE_SIZE = 20;
  private socket?: Socket;

  // ── Stats signals ──────────────────────────────────────────────────────────
  private readonly _stats = signal<ParticipationStats | null>(null);
  private readonly _isLoadingStats = signal<boolean>(false);

  readonly stats = this._stats.asReadonly();
  readonly isLoadingStats = this._isLoadingStats.asReadonly();

  // ── Messages signals ───────────────────────────────────────────────────────
  private readonly _messages = signal<ParticipationMessage[]>([]);
  private readonly _isLoadingMessages = signal<boolean>(false);
  private readonly _hasMoreMessages = signal<boolean>(true);
  private _currentPage = 0;

  readonly messages = this._messages.asReadonly();
  readonly isLoadingMessages = this._isLoadingMessages.asReadonly();
  readonly hasMoreMessages = this._hasMoreMessages.asReadonly();

  // ── Local Storage Cache signals ──────────────────────────────────────────
  private readonly _localParticipations = signal<CachedParticipation[]>([]);
  readonly localParticipations = this._localParticipations.asReadonly();

  private readonly _activeParticipationId = signal<string | null>(null);
  readonly activeParticipationId = this._activeParticipationId.asReadonly();

  private readonly _showShareModal = signal<boolean>(false);
  readonly showShareModal = this._showShareModal.asReadonly();

  constructor(private http: HttpClient) {
    this.loadLocalParticipations();
    this.initSocketConnection();
    this.loadStats();
  }

  loadLocalParticipations(): void {
    try {
      const stored = localStorage.getItem('congo_participations');
      if (stored) {
        this._localParticipations.set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse local participations:', e);
    }
  }

  addLocalParticipation(p: CachedParticipation): void {
    const current = this._localParticipations();
    // Prevent duplicate entries by email or ID
    const updated = current.filter(x => x.id !== p.id);
    updated.push(p);
    this._localParticipations.set(updated);
    try {
      localStorage.setItem('congo_participations', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save local participations:', e);
    }
  }

  openShareModal(activeId?: string): void {
    if (activeId) {
      this._activeParticipationId.set(activeId);
    } else {
      const list = this._localParticipations();
      if (list.length > 0) {
        this._activeParticipationId.set(list[list.length - 1].id);
      } else {
        this._activeParticipationId.set(null);
      }
    }
    this._showShareModal.set(true);
  }

  closeShareModal(): void {
    this._showShareModal.set(false);
    this._activeParticipationId.set(null);
  }


  private initSocketConnection(): void {
    // Connect to backend Socket.io server
    // Socket.io se connecte à la racine du serveur (sans le /api/participations)
    const socketUrl = environment.apiUrl.replace(/\/api\/?$/, '');
    this.socket = io(socketUrl);

    this.socket.on('connect', () => {
      console.log('🔌 Connected to real-time WebSockets counter');
    });

    this.socket.on('participationCountUpdated', (data: { count: number }) => {
      console.log('🔥 Real-time counter updated:', data.count);
      this._stats.update((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          totalParticipations: data.count,
        };
      });
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSockets counter');
    });
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  /**
   * Fetches participation statistics once.
   * Result is kept in the `stats` signal.
   */
  loadStats(): void {
    if (this._isLoadingStats()) return;

    this._isLoadingStats.set(true);
    this.http
      .get<ParticipationStats>(`${this.apiUrl}/stats`)
      .pipe(catchError(() => of(MOCK_STATS)))
      .subscribe({
        next: (data) => {
          this._stats.set(data);
          this._isLoadingStats.set(false);
        },
        error: () => {
          this._stats.set(MOCK_STATS);
          this._isLoadingStats.set(false);
        },
      });
  }

  // ── Messages ───────────────────────────────────────────────────────────────

  /**
   * Loads the first page of messages (called on init).
   */
  loadMessages(): void {
    if (this._isLoadingMessages()) return;
    this._currentPage = 0;
    this._messages.set([]);
    this._hasMoreMessages.set(true);
    this._fetchMessages();
  }

  /**
   * Appends the next page to the existing list.
   */
  loadMoreMessages(): void {
    if (this._isLoadingMessages() || !this._hasMoreMessages()) return;
    this._currentPage++;
    this._fetchMessages();
  }

  private _fetchMessages(): void {
    this._isLoadingMessages.set(true);
    const offset = this._currentPage * this.PAGE_SIZE;

    this.http
      .get<any[]>(
        `${this.apiUrl}?limit=${this.PAGE_SIZE}&offset=${offset}&approved=true`
      )
      .pipe(
        catchError(() =>
          of(generateMockMessages(this.PAGE_SIZE, offset))
        )
      )
      .subscribe({
        next: (data) => {
          const mapped = data.map((item: any) => {
            // If it's already mapped (like in mock messages)
            if (item.location !== undefined) {
              return item as ParticipationMessage;
            }

            // Map backend fields to frontend ParticipationMessage
            const getCountryName = (code: string): string => {
              const list = [
                { name: 'République du Congo', code: 'CG' },
                { name: 'France', code: 'FR' },
                { name: 'Belgique', code: 'BE' },
                { name: 'Canada', code: 'CA' },
                { name: 'États-Unis', code: 'US' },
                { name: 'Sénégal', code: 'SN' },
                { name: 'Côte d\'Ivoire', code: 'CI' },
                { name: 'Cameroun', code: 'CM' },
              ];
              const match = list.find((c) => c.code.toUpperCase() === code.toUpperCase());
              return match ? match.name : code;
            };

            let locationLabel = '';
            const isCongo = item.countryId?.toUpperCase() === 'CG';
            if (isCongo) {
              if (item.department) {
                locationLabel = `${item.department}, Congo`;
              } else {
                locationLabel = 'Congo';
              }
            } else {
              locationLabel = getCountryName(item.countryId || '');
            }

            return {
              id: item.id,
              firstName: item.firstName,
              location: locationLabel,
              message: item.message,
              createdAt: item.createdAt,
            } as ParticipationMessage;
          });

          this._messages.update((prev) => [...prev, ...mapped]);
          // If fewer items than page size → no more pages
          this._hasMoreMessages.set(data.length === this.PAGE_SIZE);
          this._isLoadingMessages.set(false);
        },
        error: () => {
          const mock = generateMockMessages(this.PAGE_SIZE, offset);
          this._messages.update((prev) => [...prev, ...mock]);
          this._hasMoreMessages.set(true);
          this._isLoadingMessages.set(false);
        },
      });
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  submitParticipation(payload: ParticipationPayload): Observable<ParticipationResponse> {
    const formData = new FormData();
    formData.append('firstName', payload.firstName);
    formData.append('email', payload.email);
    formData.append('countryId', payload.countryId);

    if (payload.department) {
      formData.append('department', payload.department);
    }

    formData.append('message', payload.message);
    formData.append('card', payload.card);

    return this.http
      .post<ParticipationResponse>(this.apiUrl, formData)
      .pipe(catchError(this.handleError));
  }

  subscribeToNewsletter(email: string): Observable<any> {
    return this.http
      .post<any>(`${environment.apiUrl}/newsletter/subscribe`, { email })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue est survenue.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      errorMessage =
        error.error?.message ||
        `Code d'erreur : ${error.status}\nMessage : ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
