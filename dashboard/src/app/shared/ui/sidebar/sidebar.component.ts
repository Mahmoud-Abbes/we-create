import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ProjectService, ProjectSidebarDTO } from '../../../services/projects/project.service';
import { CommonModule } from '@angular/common';
import { KeycloakService } from '../../../services/auth/keycloak.service';
import { AccountSettingsService } from '../../../services/api/account.settings.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  projects: ProjectSidebarDTO[] = [];
  loadFailed = false;
  private sidebarRefreshSub?: Subscription;

  constructor(
    private projectService: ProjectService,
    public authService: KeycloakService,
    private router: Router,
    private accountSettingsService: AccountSettingsService,
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadUserProfile();
    this.sidebarRefreshSub = this.projectService.sidebarRefresh$.subscribe(() => {
      this.loadProjects();
    });
  }

  ngOnDestroy(): void {
    this.sidebarRefreshSub?.unsubscribe();
  }

  loadUserProfile() {
    this.accountSettingsService.getProfile().subscribe({
      next: (profile) => {
        this.authService.setLocalProfile(profile.username, profile.fullName);
      },
      error: (err) => {
        console.error('Could not load user profile details for sidebar', err);
      }
    });
  }

  loadProjects() {
    this.loadFailed = false;
    this.projectService.getSidebarProjects().subscribe({
      next: (data: ProjectSidebarDTO[]) => {
        this.projects = data;
        this.loadFailed = false;
      },
      error: (err: any) => {
        console.error('Project load failed', err);
        this.loadFailed = true;
      },
    });
  }

  getFormattedUsername(): string {
    const username = this.authService.getUsername() || '';
    return username.length > 17 ? username.substring(0, 17) + '...' : username;
  }

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  navigateToSettongs() {
    this.router.navigate(['/account-settings']);
  }
}
