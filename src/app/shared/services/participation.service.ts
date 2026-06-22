import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class ParticipationService {
  private readonly apiUrl = 'http://localhost:3000/api/participations';

  constructor(private http: HttpClient) {}

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

    return this.http.post<ParticipationResponse>(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue est survenue.';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Code d'erreur : ${error.status}\nMessage : ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
