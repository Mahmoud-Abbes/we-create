import { Component, inject, OnInit } from '@angular/core';
import { KeycloakService } from '../../services/auth/keycloak.service';
import { SyncService } from '../../services/auth/sync.service';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { Router, RouterLink } from '@angular/router';
import { CreateShowcaseService } from '../../services/projects/create.showcase.service';

@Component({
  selector: 'app-welcome',
  imports: [SidebarComponent, RouterLink],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
  standalone: true,
})
export class WelcomeComponent implements OnInit {
  sidebarCollapsed = false;

  constructor(private router: Router, private showcaseService: CreateShowcaseService) { }

  onSidebarCollapsedChange(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  navigateToNewProject(): void {
    this.router.navigate(['/create']);
  }

  private syncService = inject(SyncService);
  private authService = inject(KeycloakService);

  // Temporary code
  fullName = '';
  // End of Temporary code

ngOnInit() {
  const keycloakInstance = this.authService.keycloak;

  if (keycloakInstance?.authenticated) {
    this.syncService.syncUser().subscribe(() => {
      // Check the service state directly
      const isCurrentlyCreating = this.showcaseService.isShowcaseCreating$.value;
      
      if (isCurrentlyCreating) {
        console.log("Redirecting to /creating because a process is active.");
        this.router.navigate(['/creating']);
      }
    });
  }
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

  onCreateProject() {
    this.router.navigate(['/create']);
  }
}
