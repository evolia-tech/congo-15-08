import { Component } from '@angular/core';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-history-timeline',
  templateUrl: './history-timeline.component.html',
  styleUrl: './history-timeline.component.scss',
  imports: [

  ]
})
export class HistoryTimelineComponent {
  timelineEvents: TimelineEvent[] = [
    {
      year: '15 Août 1960',
      title: "Proclamation de l'Indépendance",
      description: "Le 15 août 1960, la République du Congo proclame officiellement son indépendance vis-à-vis de la France. Cet événement historique marque la naissance d'un État souverain et le début d'un grand destin collectif pour le peuple congolais."
    },
    {
      year: '13-15 Août 1963',
      title: 'Les Trois Glorieuses',
      description: "Trois journées de soulèvement populaire pacifique entraînent des changements constitutionnels majeurs. Ces dates clés renforcent l'attachement national aux libertés démocratiques et inscrivent la mémoire syndicale et étudiante dans l'identité congolaise."
    },
    {
      year: 'Chaque Année',
      title: 'Célébrations Commémoratives',
      description: "Le 15 août est célébré à travers tout le pays. Des défilés officiels, des danses traditionnelles et des concerts populaires sont organisés dans tous les départements, célébrant l'unité et consolidant la fierté d'appartenir à une seule patrie."
    },
    {
      year: '15 Août 2026',
      title: "La Flamme Numérique de l'Unité",
      description: "Le projet de la flamme virtuelle modernise la fête nationale. En mariant histoire et technologie, ce symbole numérique permet de connecter en direct le pays et les Congolais de l'étranger pour allumer ensemble le flambeau de la paix."
    }
  ];
}
