import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ParticipationService } from '../../../shared/services/participation.service';

@Component({
  selector: 'app-newletters',
  templateUrl: './newletters.html',
  styleUrl: './newletters.scss',
  imports: [FormsModule, InputTextModule, ButtonModule]
})
export class Newletters {
  private readonly participationService = inject(ParticipationService);

  public email = '';
  public isSubmitting = signal<boolean>(false);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.email || !this.email.includes('@')) {
      this.errorMessage.set('Veuillez entrer une adresse email valide.');
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.participationService.subscribeToNewsletter(this.email).subscribe({
      next: (res: any) => {
        this.successMessage.set('Merci ! Votre inscription à la newsletter a été enregistrée.');
        this.email = '';
        this.isSubmitting.set(false);
      },
      error: (err: any) => {
        const msg = err?.message || 'Une erreur est survenue lors de l\'inscription.';
        this.errorMessage.set(msg);
        this.isSubmitting.set(false);
      }
    });
  }
}

