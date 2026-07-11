import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';

import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        //anchorScrolling: 'enabled',
      }),
      withViewTransitions(),
    ),
    provideHttpClient(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura,
      },
    }),
  ],
};
