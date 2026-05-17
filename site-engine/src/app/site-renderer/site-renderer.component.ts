import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../api/project.service';
import { ProjectPublicDTO } from '../models/project-dto.model';
import { EcommerceComponent } from '../sites/ecommerce/ecommerce.component';

@Component({
  selector: 'app-site-renderer',
  standalone: true,
  imports: [CommonModule, RouterOutlet, EcommerceComponent],
  templateUrl: './site-renderer.component.html',
  styleUrl: './site-renderer.component.scss',
})
export class SiteRendererComponent implements OnInit {
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
          if (data) {
            // 1. FIX: Parse stringified JSON from backend into a JS Object
            if (typeof data.jsonContent === 'string') {
              try {
                data.jsonContent = JSON.parse(data.jsonContent);
              } catch (e) {
                console.error("Failed to parse jsonContent string", e);
              }
            }
            // 2. Normalize type
            if (data.projectType) {
              data.projectType = data.projectType.toLowerCase() as any;
            }
          }
          this.projectData = data;
          this.errorMessage = '';
        },
        error: (err) => {
          console.error('Project fetch error:', err);
          if (err.status === 0) {
            this.errorMessage = 'Connection failed. Check CORS or Backend status.';
          } else {
            this.errorMessage = err.error?.message || err.message || `Error ${err.status}`;
          }
          this.projectService.clearRAM();
        },
      });
    }
  }
}