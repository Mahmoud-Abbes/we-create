import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProjectService } from '../../../../../api/project.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-basic-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './basic-header.component.html',
  styleUrl: './basic-header.component.scss'
})
export class BasicHeaderComponent {
  private projectService = inject(ProjectService);

  // Map to jsonContent so data.identity exists in the template
  siteData$ = this.projectService.siteData$.pipe(
    map((project: any) => project?.jsonContent)
  );

  getHeaderStyle(data: any) {
    return { 'background-color': data?.header?.specialColor || null };
  }
}