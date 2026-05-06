import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from './keycloak.service';
import { from, switchMap, catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloakService = inject(KeycloakService);

  // If we don't have keycloak or aren't authenticated, just pass the request through.
  if (!keycloakService.keycloak || !keycloakService.isAuthenticated) {
    return next(req);
  }

  return from(keycloakService.keycloak.updateToken(30)).pipe(
    switchMap(() => {
      const token = keycloakService.getToken();
      if (token) {
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(authReq);
      }
      return next(req);
    }),
    catchError((err) => {
      // We only want to handle token refresh failures here if we want to redirect to login.
      // But we should NOT logout if the backend simply returns a 401 (which could be due to issuer mismatch).
      console.error('Auth Interceptor Error:', err);
      return throwError(() => err);
    })
  );
};
