import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import type Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  private platformId = inject(PLATFORM_ID);
  // A 'Subject' to tell the rest of the app when auth is fully loaded
  public isReady$ = new BehaviorSubject<boolean>(false);
  public keycloak: Keycloak | null = null;

  async init() {
    /**
     * RULE #4 (CSP) & SSR Safety:
     * Logic ensures Keycloak (a browser-based OIDC client) only initializes on the client side.
     * Prevents the server from executing third-party scripts, which maintains a clean
     * Content Security Policy during the initial Prerender/Server render.
     */
    if (!isPlatformBrowser(this.platformId)) return;

    /**
     * DYNAMIC IMPORT:
     * By using 'import()', we tell the builder to only load this module in the browser.
     * This fixes the "Failed to resolve module specifier" error because Vite will
     * bundle it correctly for the client side.
     */
    const KeycloakModule = await import('keycloak-js');
    const Keycloak = KeycloakModule.default;

    this.keycloak = new Keycloak({
      url: environment.keycloakUrl, // Use the environment variable!
      realm: 'we-create',
      clientId: 'we-create-frontend',
    });

    try {
      await this.keycloak.init({
        /**
         * RULE #2 (JWT & Auth Security):
         * Implementation of PKCE (Proof Key for Code Exchange) using S256.
         * Correlation: In Public Clients (Angular), we cannot safely store a Client Secret.
         * PKCE S256 creates a dynamic, one-time cryptographic bridge that ensures the
         * authorization code cannot be intercepted and used by an attacker (Session Hijacking).
         */
        pkceMethod: 'S256',
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        /**
         * Some Keycloak setups block iframe-based cookie checks with CSP frame-ancestors.
         * Disable iframe/session polling so auth starts only when login() is triggered.
         */
        checkLoginIframe: false,
      });
      this.isReady$.next(true);
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      this.isReady$.next(true); // Still set to true so the UI doesn't hang
    }
  }

  get isAuthenticated(): boolean {
    return !!this.keycloak?.authenticated;
  }

  async login(redirectPath = '/welcome'): Promise<void> {
    if (!this.keycloak) {
      throw new Error('Keycloak is not initialized');
    }

    await this.keycloak.login({
      redirectUri: `${window.location.origin}${redirectPath}`,
    });
  }

  /**
   * RULE #2 (Auth Security): Session Termination
   * Correlation: logout() invalidates the token on the Keycloak server.
   * Without this, a token might stay active even if you clear the
   * local state, violating Rule #2 (Session Hijacking risk).
   */
  logout() {
    this.keycloak?.logout({
      // After logout, send them back to your landing page
      redirectUri: window.location.origin,
    });
  }

  /**
   * RULE #2 (JWT & Auth Security):
   * Correlation: The token is maintained in-memory within this service.
   * Avoids Rule #2 violation (storing JWT in localStorage) which is vulnerable to
   * RULE #1 (XSS) script-based token theft.
   */
  getToken() {
    return this.keycloak?.token;
  }

  getUserFullName(): string {
    const tokenParsed = this.keycloak?.tokenParsed as any;
    if (!tokenParsed) return 'Unknown User';
    const first = tokenParsed.given_name || '';
    const last = tokenParsed.family_name || '';
    return `${first} ${last}`.trim() || 'Anonymous User';
  }

  getUsername(): string {
    const tokenParsed = this.keycloak?.tokenParsed as any;
    return tokenParsed?.preferred_username || 'anonymous';
  }
}
