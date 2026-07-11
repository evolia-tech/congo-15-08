import { Component, EventEmitter, Output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ParticipationFormComponent } from '../../../shared/components/participation-form/participation-form.component';

@Component({
  selector: 'app-participation',
  templateUrl: './participation.component.html',
  styleUrl: './participation.component.scss',
  imports: [
    NgOptimizedImage,
    ParticipationFormComponent
  ]
})
export class ParticipationComponent {
  @Output() submitSuccess = new EventEmitter<{ firstName: string, location: string }>();
}
