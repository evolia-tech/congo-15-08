import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-history-actions',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './history-actions.component.html',
  styleUrl: './history-actions.component.scss'
})
export class HistoryActionsComponent {}
