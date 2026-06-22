import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FlameCounterComponent } from '../../../shared/components/flame-counter/flame-counter.component';
import { ParticipationFormComponent } from '../../../shared/components/participation-form/participation-form.component';

@Component({
  selector: 'app-participate-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, FlameCounterComponent, ParticipationFormComponent],
  templateUrl: './participate-hero.component.html',
  styleUrl: './participate-hero.component.scss'
})
export class ParticipateHeroComponent {
  @Input() flamesTotal = 0;
  @Input() showSuccess = false;
  
  @Output() formSuccess = new EventEmitter<{ firstName: string, location: string }>();
  @Output() resetSuccess = new EventEmitter<void>();

  onFormSubmitSuccess(event: { firstName: string, location: string }): void {
    this.formSuccess.emit(event);
  }

  resetForm(): void {
    this.resetSuccess.emit();
  }
}
