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
  ) { }

  ngOnInit(): void {
    // Subscribe to paramMap to detect slug changes dynamically on router reuse
    this.route.paramMap.subscribe(params => {
      this.projectSlug = params.get('slug') ?? '';
      if (this.projectSlug) {
        this.loadPreview();
      }
    });
  }

  loadPreview(): void {
    this.safeUrl = undefined; // Triggers the loading state

    this.tokenService.getBurnerToken(this.projectSlug).subscribe({
      next: (res: any) => {
        // Constructing the engine URL with the one-time token and origin
        const rawUrl = `${window.location.origin}/${this.projectSlug}?previewToken=${res.previewToken}&origin=dashboard`;
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
      },
      error: (err) => {
        console.error('Burner Token acquisition failed:', err);
      }
    });
  }
}