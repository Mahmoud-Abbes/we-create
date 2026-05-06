import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService, Project } from '../../../services/projects/project.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
    @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();
 
  projects: Project[] = [];
 
  constructor(private projectService: ProjectService, private router: Router) {}
 
  ngOnInit(): void {
    this.projectService.fetchProjects().subscribe((projects) => {
      this.projects = projects;
    });
  }
 
  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
 
  navigateToNewProject(): void {
    this.router.navigate(['/create']);
  }


}
