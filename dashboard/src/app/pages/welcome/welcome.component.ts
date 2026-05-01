import { Component, inject, OnInit } from '@angular/core';
import { KeycloakService } from '../../auth/keycloak.service';
import { SyncService } from '../../auth/sync.service';

@Component({
  selector: 'app-welcome',
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
  standalone: true,
})
export class WelcomeComponent implements OnInit {
  private syncService = inject(SyncService);

  // Temporary code
  private authService = inject(KeycloakService);
  fullName = '';
  // End of Temporary code

  ngOnInit() {
    const keycloakInstance = this.authService.keycloak;
    if (keycloakInstance?.authenticated) {
      this.syncService.syncUser().subscribe();
    }
    
    // Temporary code
    const profile = (this.authService as any).keycloak?.tokenParsed;
    this.fullName = `${profile?.name || ''} ${profile?.preferred_username || ''}` || 'Developer';
    // End of Temporary code
  }

  // Temporary code
  handleLogout() {
    /**
     * RULE #2 (Auth Security): Complete Session Termination
     * We don't just clear the UI; we tell Keycloak to invalidate the
     * SSO session so the user is truly logged out of the realm.
     */
    this.authService.logout();
  }
  // End of Temporary code
}
