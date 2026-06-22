import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { EmptyLayout } from './layout/empty-layout/empty-layout';
import { HomeComponent } from './home/home.component';
import { LiveComponent } from './live/live.component';
import { RevelationComponent } from './revelation/revelation.component';
import { ParticipateComponent } from './participate/participate.component';
import { HistoryComponent } from './history/history.component';

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
    //  { path: 'about', component: AboutComponent },
    ],
  },

  // 2. Pages SANS Header/Footer (ex: Checkout, Login)
  {
    path: '',
    component: EmptyLayout,
    children: [
    //  { path: 'checkout', component: CheckoutComponent },
    ],
  },

  // Redirection si page inconnue
  { path: '**', redirectTo: '' },
];
