import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './services/auth/interceptor.service';
import { KeycloakService } from './services/auth/keycloak.service';

/**
 * Factory function to initialize the Keycloak service during the application bootup.
 */
function initializeKeycloak(keycloak: KeycloakService) {
  return () => keycloak.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    /**
     * RULE #5 (Third-Party Script Abuse):
     * withFetch() uses the modern Fetch API which honors modern security headers
     * and CORS more strictly than the older XHR, reducing the risk of data leakage.
     */
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAnimations(), // Required for Toastr
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),

    {
      /**
       * RULE #2 (Auth Security):
       * APP_INITIALIZER forces the security handshake before any UI is rendered.
       * Correlation: Prevents 'Flash of Unauthenticated Content' (FOUC), ensuring
       * the browser doesn't execute protected business logic before the JWT is verified.
       */
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService], // Tell Angular to give this function the service
    },
  ],
};
