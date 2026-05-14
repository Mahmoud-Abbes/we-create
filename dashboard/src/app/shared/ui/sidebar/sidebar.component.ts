import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ProjectService, ProjectSidebarDTO } from '../../../services/projects/project.service';
import { CommonModule } from '@angular/common';
import { KeycloakService } from '../../../services/auth/keycloak.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  projects: ProjectSidebarDTO[] = [];
  loadFailed = false; // Internal flag for project loading

  constructor(
    private projectService: ProjectService,
    public authService: KeycloakService,
  ) {}

  ngOnInit(): void {
    this.loadProjects();
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
      }
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
}