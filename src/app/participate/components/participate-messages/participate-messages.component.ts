import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ParticipationService,
  ParticipationMessage,
} from '../../../shared/services/participation.service';

@Component({
  selector: 'app-participate-messages',
  templateUrl: './participate-messages.component.html',
  styleUrl: './participate-messages.component.scss',
  imports: [CommonModule],
})

export class ParticipateMessagesComponent implements OnInit {
  private participationService = inject<ParticipationService>(ParticipationService);

  readonly messages = computed<ParticipationMessage[]>(
    () => this.participationService.messages()
  );
  readonly isLoading = computed<boolean>(
    () => this.participationService.isLoadingMessages()
  );
  readonly hasMore = computed<boolean>(
    () => this.participationService.hasMoreMessages()
  );

  ngOnInit(): void {
    this.participationService.loadMessages();
  }

  loadMore(): void {
    this.participationService.loadMoreMessages();
  }

  /** Formats ISO date to a readable relative label */
  formatDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / 3_600_000);
    const diffD = Math.floor(diffH / 24);

    if (diffH < 1) return 'il y a moins d\'une heure';
    if (diffH < 24) return `il y a ${diffH}h`;
    if (diffD < 7) return `il y a ${diffD} jour${diffD > 1 ? 's' : ''}`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
