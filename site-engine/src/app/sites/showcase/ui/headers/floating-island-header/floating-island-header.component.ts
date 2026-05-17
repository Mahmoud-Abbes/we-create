import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProjectService } from '../../../../../api/project.service'; // Added one more ../
import { map } from 'rxjs';

@Component({
  selector: 'app-floating-island-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './floating-island-header.component.html',
  styleUrl: './floating-island-header.component.scss',
})
export class FloatingIslandHeaderComponent {
  private projectService = inject(ProjectService);

  siteData$ = this.projectService.siteData$.pipe(
    map((project: any) => project?.jsonContent)
  );

  getHeaderStyle(data: any) {
    return {
      'background-color': data?.header?.specialColor || null
    };
  }
}