import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SyncService } from '../services/auth/sync.service';
import { KeycloakService } from '../services/auth/keycloak.service';
import { catchError, map, of } from 'rxjs';

export const authRoutesGuard: CanActivateFn = (route, state) => {
  const syncService = inject(SyncService);
  const authService = inject(KeycloakService);
  const router = inject(Router);

  // 1. If not even authenticated in Keycloak, go to Landing (home page)
  if (!authService.isAuthenticated) {
    return of(router.parseUrl('/'));
  }

  // 2. If authenticated, wait for/trigger user sync to complete
  return syncService.syncUser().pipe(
    map(() => true),
    catchError((err) => {
      console.error('Auth guard sync failed:', err);
      return of(router.parseUrl('/welcome'));
    })
  );
};


