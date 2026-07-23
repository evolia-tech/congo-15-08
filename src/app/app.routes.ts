import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { EmptyLayout } from './layout/empty-layout/empty-layout';
import { HomeComponent } from './home/home.component';
import { LiveComponent } from './live/live.component';
import { RevelationComponent } from './revelation/revelation.component';
import { ParticipateComponent } from './participate/participate.component';
import { HistoryComponent } from './history/history.component';
import { UnsubscribeComponent } from './unsubscribe/unsubscribe';
import { MentionsLegalesComponent } from './legal/mentions-legales';
import { ConfidentialiteComponent } from './legal/confidentialite';
import { SponsorsComponent } from './sponsors/sponsors.component';
import { PreviewComponent } from './preview/preview.component';

export const routes: Routes = [
  // 1. Pages AVEC Header/Footer
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: HomeComponent },
      { path: 'live', component: LiveComponent },
      { path: 'revelation', component: RevelationComponent },
      { path: 'participer', component: ParticipateComponent },
      { path: 'histoire', component: HistoryComponent },
      { path: 'mentions-legales', component: MentionsLegalesComponent },
      { path: 'confidentialite', component: ConfidentialiteComponent },
      { path: 'sponsors', component: SponsorsComponent },
      { path: 'preview', component: PreviewComponent },
    //  { path: 'about', component: AboutComponent },
    ],
  },

  // 2. Pages SANS Header/Footer (ex: Checkout, Login, Désinscription)
  {
    path: '',
    component: EmptyLayout,
    children: [
      { path: 'desinscription', component: UnsubscribeComponent },
    //  { path: 'checkout', component: CheckoutComponent },
    ],
  },

  // Redirection si page inconnue
  { path: '**', redirectTo: '' },
];

