import { Component, inject, OnInit } from '@angular/core';
import { KeycloakService } from '../../services/auth/keycloak.service';
import { SyncService } from '../../services/auth/sync.service';
import { Router, RouterLink } from '@angular/router';
import { CreateShowcaseService } from '../../services/projects/create.showcase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  imports: [RouterLink, CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
  standalone: true,
})
export class WelcomeComponent implements OnInit {
  // Status tracking: 'loading' | 'auth_failed' | 'sync_failed' | 'ready'
  status: 'loading' | 'auth_failed' | 'sync_failed' | 'ready' = 'loading';

  private router = inject(Router);
  private showcaseService = inject(CreateShowcaseService);
  private syncService = inject(SyncService);
  public authService = inject(KeycloakService);

  ngOnInit() {
    this.authService.isReady$.subscribe((ready) => {
      if (ready) {
        this.checkAccess();
      }
    });
  }

  checkAccess() {
    if (!this.authService.isAuthenticated) {
      this.status = 'auth_failed';
      return;
    }

    this.status = 'loading';
    this.syncService.syncUser().subscribe({
      next: () => {
        this.status = 'ready';
        if (this.showcaseService.isShowcaseCreating$.value) {
          this.router.navigate(['/creating']);
        }
      },
      error: () => {
        this.status = 'sync_failed';
      }
    });
  }

  handleLogin() {
    this.authService.login();
  }

  goHome() {
    window.location.href = '/';
  }

  getFirstName(): string {
    const token = this.authService.keycloak?.tokenParsed as any;
    return token?.given_name || 'User';
  }
}