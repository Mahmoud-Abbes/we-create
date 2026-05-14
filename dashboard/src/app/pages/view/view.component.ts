import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { PreviewTokenService } from '../../services/Preview/preview-token.service';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
})
export class ViewComponent implements OnInit {
  projectSlug: string = '';
  safeUrl?: SafeResourceUrl;

  constructor(
    private route: ActivatedRoute,
    private tokenService: PreviewTokenService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Correctly extracting the slug from the URL parameters
    this.projectSlug = this.route.snapshot.paramMap.get('slug') ?? '';
    
    if (this.projectSlug) {
      this.loadPreview();
    }
  }

  loadPreview(): void {
    this.safeUrl = undefined; // Triggers the loading state

    this.tokenService.getBurnerToken(this.projectSlug).subscribe({
      next: (res: any) => {
        // Constructing the engine URL with the one-time token and origin
        const rawUrl = `http://localhost:4100/${this.projectSlug}?previewToken=${res.previewToken}&origin=dashboard`;
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
      },
      error: (err) => {
        console.error('Burner Token acquisition failed:', err);
      }
    });
  }
}