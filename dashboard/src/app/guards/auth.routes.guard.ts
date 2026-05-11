import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SyncService } from '../services/auth/sync.service';
import { KeycloakService } from '../services/auth/keycloak.service';

export const authRoutesGuard: CanActivateFn = (route, state) => {
  const syncService = inject(SyncService);
  const authService = inject(KeycloakService);
  const router = inject(Router);

  // 1. If not even authenticated in Keycloak, go to Landing
  if (!authService.isAuthenticated) {
    return router.parseUrl('/');
  }

  // 2. If authenticated but the backend sync hasn't happened yet, go to Welcome
  if (!syncService.isSynced) {
    return router.parseUrl('/welcome');
  }

  return true;
};
