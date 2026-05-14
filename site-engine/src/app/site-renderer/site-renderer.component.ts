import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../api/project.service';
import { ProjectPublicDTO } from '../models/project-dto.model';
import { ShowcaseComponent } from '../sites/showcase/showcase.component';
import { EcommerceComponent } from '../sites/ecommerce/ecommerce.component';

@Component({
  selector: 'app-site-renderer',
  imports: [CommonModule, ShowcaseComponent, EcommerceComponent],
  templateUrl: './site-renderer.component.html',
  styleUrl: './site-renderer.component.scss',
})
export class SiteRendererComponent implements OnInit{
  projectData?: ProjectPublicDTO;
  errorMessage: string = '';
  currentSlug: string = '';

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
  ) {}

  ngOnInit() {
    this.currentSlug = this.route.snapshot.paramMap.get('slug') || '';
    const token = this.route.snapshot.queryParamMap.get('previewToken') || undefined;
    const origin = this.route.snapshot.queryParamMap.get('origin') || undefined;

    if (this.currentSlug) {
      this.projectService.getProjectData(this.currentSlug, token, origin).subscribe({
        next: (data) => {
          this.projectData = data;
          this.errorMessage = '';
        },
        error: (err) => {
          console.error('Project fetch error:', err);
          
          if (err.status === 0) {
            this.errorMessage = 'Connection failed. This is likely a CORS issue or the backend is down.';
          } else {
            // Prioritize the message from the backend, fallback to status text if missing
            this.errorMessage = err.error?.message || err.message || `Error ${err.status}: ${err.statusText}`;
          }
        },
      });
    }
  }
}
