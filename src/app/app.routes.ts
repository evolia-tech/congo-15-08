import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { EmptyLayout } from './layout/empty-layout/empty-layout';

export const routes: Routes = [
  // 1. Pages AVEC Header/Footer
  {
    path: '',
    component: MainLayout,
    children: [
    //  { path: '', component: HomeComponent },
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
