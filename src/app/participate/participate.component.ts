import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipateHeroComponent } from './components/participate-hero/participate-hero.component';
import { ParticipateReassuranceComponent } from './components/participate-reassurance/participate-reassurance.component';

@Component({
  selector: 'app-participate',
  standalone: true,
  imports: [
    CommonModule,
    ParticipateHeroComponent,
    ParticipateReassuranceComponent
  ],
  templateUrl: './participate.component.html',
  styleUrl: './participate.component.scss',
})
export class ParticipateComponent {
  showSuccess = false;

  // Mock static stats
  flamesTotal = 742158;
  countriesCount = 195;
  departmentsCount = 12;

  onFormSuccess(event: { firstName: string, location: string }): void {
    this.flamesTotal++;
    this.showSuccess = true;
  }

  onResetSuccess(): void {
    this.showSuccess = false;
  }
}
