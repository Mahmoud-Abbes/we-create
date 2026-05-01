import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SyncService } from '../auth/sync.service';

export const authRoutesGuard: CanActivateFn = (route, state) => {
  const syncService = inject(SyncService);
  const router = inject(Router);

  if (syncService.isSynced) {
    return true;
  }
  
  // Kick back to welcome to force the sync process
  return router.parseUrl('/welcome');
};