import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface EventItem {
  time: string;
  title: string;
  description: string;
  location: string;
}

@Component({
  selector: 'app-program-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './program-schedule.component.html',
  styleUrl: './program-schedule.component.scss',
})
export class ProgramScheduleComponent {
  selectedDay = signal<'14' | '15'>('14');

  program14: EventItem[] = [
    { time: '09h00 – 11h00', title: 'Prise d’Armes & Décorations', description: 'Remise des insignes du Mérite Congolais aux citoyens honorés.', location: 'Esplanade du Palais du Peuple' },
    { time: '15h00 – 17h00', title: 'Conférences & Expositions', description: 'Tables rondes historiques sur l’indépendance et vernissages d’art.', location: 'Palais des Congrès' },
    { time: '20h00', title: 'Message à la Nation du Président', description: 'Discours solennel du Chef de l’État diffusé sur Télé Congo.', location: 'Médias Nationaux' },
    { time: '21h00 – Minuit', title: 'Concerts de la Veille & Feux d’artifice', description: 'Concerts de Rumba en plein air suivis du grand embrasement à minuit.', location: 'Tous les arrondissements' }
  ];

  program15: EventItem[] = [
    { time: '07h30 – 08h15', title: 'Rituel Mémoriel', description: 'Dépôt de gerbes de fleurs par le Chef de l’État aux monuments historiques.', location: 'Mausolée Marien Ngouabi' },
    { time: '08h30 – 09h15', title: 'Arrivée des Officiels', description: 'Installation du corps diplomatique et honneurs militaires (21 coups de canon).', location: 'Boulevard Alfred Raoul' },
    { time: '09h30 – 11h00', title: 'Le Grand Défilé Militaire', description: 'Parade des troupes à pied, démonstration motorisée et survol aérien.', location: 'Boulevard Alfred Raoul' },
    { time: '11h00 – 13h30', title: 'Le Grand Défilé Civil', description: 'Passage des forces vives de la nation (entreprises, écoles, associations).', location: 'Boulevard Alfred Raoul' },
    { time: '14h00 – 16h00', title: 'Banquet Officiel', description: 'Réception officielle offerte par le couple présidentiel aux invités de marque.', location: 'Palais du Peuple' },
    { time: '16h30 – 18h30', title: 'Finales des Tournois Sportifs', description: 'Coupes de football de l’indépendance et grands prix cyclistes.', location: 'Stade Massamba-Débat' },
    { time: '19h00 – Tard', title: 'Réjouissances Populaires', description: 'Concerts géants, bals populaires et partages de repas traditionnels.', location: 'Places publiques' }
  ];

  setDay(day: '14' | '15'): void {
    this.selectedDay.set(day);
  }
}
