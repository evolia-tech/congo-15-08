import { Component, OnInit, OnDestroy } from '@angular/core';

interface FeedItem {
  id: number;
  name: string;
  location: string;
}

@Component({
  selector: 'app-live-feed',
  standalone: true,
  imports: [],
  templateUrl: './live-feed.component.html',
  styleUrl: './live-feed.component.scss',
})
export class LiveFeedComponent implements OnInit, OnDestroy {
  feedItems: FeedItem[] = [];
  private idCounter = 0;
  private intervalId?: any;

  private readonly names = [
    'Jean', 'Mireille', 'Rodrigue', 'Christian', 'Grace', 'Elikia',
    'Dieudonné', 'Marie', 'Gloire', 'Divine', 'Armel', 'Sylvie',
    'Brice', 'Chantal', 'Florian', 'Arnaud', 'Sandrine', 'Lionel'
  ];

  private readonly locations = [
    'Brazzaville', 'Pointe-Noire', 'France', 'Belgique', 'Canada',
    'Kouilou', 'Niari', 'Bouenza', 'Lékoumou', 'Pool', 'Plateaux',
    'Cuvette', 'Cuvette-Ouest', 'Sangha', 'Likouala', 'Sénégal',
    'Cameroun', 'Côte d\'Ivoire'
  ];

  ngOnInit(): void {
    // Pre-populate with 4 items
    for (let i = 0; i < 4; i++) {
      this.addSimulatedItem();
    }
    this.startSimulation();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startSimulation(): void {
    if (typeof window !== 'undefined') {
      this.intervalId = setInterval(() => {
        this.addSimulatedItem();
      }, 3000);
    }
  }

  private addSimulatedItem(): void {
    const randomName = this.names[Math.floor(Math.random() * this.names.length)];
    const randomLocation = this.locations[Math.floor(Math.random() * this.locations.length)];
    this.addNewFlame(randomName, randomLocation);
  }

  addNewFlame(name: string, location: string): void {
    this.idCounter++;
    const newItem: FeedItem = {
      id: this.idCounter,
      name,
      location
    };

    // Add to start of array for descending top-to-bottom scroll flow
    this.feedItems.unshift(newItem);

    // Enforce max 6 visible items
    if (this.feedItems.length > 6) {
      this.feedItems.pop();
    }
  }
}
