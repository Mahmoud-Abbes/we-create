import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { KeycloakService } from './services/auth/keycloak.service';
import { SyncService } from './services/auth/sync.service';
import { SidebarComponent } from './shared/ui/sidebar/sidebar.component';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, AsyncPipe, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class App implements OnInit, OnDestroy {
  public authService = inject(KeycloakService);
  private syncService = inject(SyncService);
  private router = inject(Router);

  protected readonly isAuthReady$ = this.authService.isReady$;
  
  sidebarCollapsed = false;
  showSidebar = false;
  private routeSub?: Subscription;

  ngOnInit() {
    // 1. Initial Auth/Sync Logic
    this.isAuthReady$.subscribe(ready => {
      if (ready && this.authService.isAuthenticated) {
        this.syncService.syncUser().subscribe({
          next: () => this.updateSidebarVisibility(),
          error: () => this.updateSidebarVisibility()
        });
      }
    });

    // 2. Route-based Sidebar Visibility
    this.routeSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateSidebarVisibility();
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  private updateSidebarVisibility() {
    const url = this.router.url;
    
    // RESTRICTIONS: Don't show on Landing (/) or Create pages (/create, /creating)
    const isRestricted = url === '/' || url.startsWith('/create') || url.startsWith('/creating');
    
    // LOGIC: Show if Auth + Sync + Not Restricted
    this.showSidebar = this.authService.isAuthenticated && 
                        this.syncService.isSynced && 
                        !isRestricted;
  }

  onSidebarCollapsedChange(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
}
