import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ParticipationPayload {
  firstName: string;
  email: string;
  countryId: string;
  department?: string;
  message: string;
  photo: File;
}

export interface ParticipationResponse {
  id: string;
  firstName: string;
  email: string;
  countryId: string;
  department?: string;
  message: string;
  photoUrl: string;
  isApproved: boolean;
  createdAt: string;
}

export interface ParticipationStats {
  totalParticipations: number;
  departmentsParticipated: number;
  diasporaCountries: number;
  localParticipations: number;
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
  totalParticipations: 742158,
  departmentsParticipated: 12,
  diasporaCountries: 48,
  localParticipations: 684320,
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
  private readonly apiUrl = 'http://localhost:3000/api/participations';
  private readonly PAGE_SIZE = 20;

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

  constructor(private http: HttpClient) {}

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
      .get<ParticipationMessage[]>(
        `${this.apiUrl}?limit=${this.PAGE_SIZE}&offset=${offset}&approved=true`
      )
      .pipe(
        catchError(() =>
          of(generateMockMessages(this.PAGE_SIZE, offset))
        )
      )
      .subscribe({
        next: (data) => {
          this._messages.update((prev) => [...prev, ...data]);
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
    formData.append('photo', payload.photo);

    return this.http
      .post<ParticipationResponse>(this.apiUrl, formData)
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
