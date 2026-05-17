import { 
  AfterViewInit, Component, ElementRef, HostListener, Inject, 
  OnDestroy, OnInit, PLATFORM_ID, ViewChild, Input, OnChanges, 
  SimpleChanges, ViewEncapsulation, inject 
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-partners-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './partners-section.component.html',
  styleUrl: './partners-section.component.scss',
  encapsulation: ViewEncapsulation.None // Bypasses scoping to protect marquee keyframe calculations
})
export class PartnersSectionComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() content: any; // Handed down by HomePageEngine

  shouldScroll = false;
  private measureTimer: any;
  private trimRunId = 0;
  trimmedLogoMap: Record<string, string> = {};

  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('logoGroup') logoGroup?: ElementRef<HTMLDivElement>;

  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (this.content) {
      this.prepareTrimmedLogos(this.content.companyUrlImages || []);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-check and run canvas padding cropping whenever image arrays shift
    if (changes['content'] && this.content) {
      this.prepareTrimmedLogos(this.content.companyUrlImages || []);
      this.queueMeasure();
    }
  }

  ngAfterViewInit(): void {
    this.queueMeasure();
  }

  ngOnDestroy(): void {
    if (this.measureTimer) clearTimeout(this.measureTimer);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.queueMeasure();
  }

  onLogoLoad(): void {
    this.queueMeasure();
  }

  getDisplayLogoUrl(url: string): string {
    return this.trimmedLogoMap[url] || url;
  }

  private queueMeasure(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.measureTimer) clearTimeout(this.measureTimer);
    // Wait for the next macro-tick execution window to evaluate element widths
    this.measureTimer = setTimeout(() => this.updateScrollState(), 0);
  }

  private updateScrollState(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const container = this.scrollContainer?.nativeElement;
    const group = this.logoGroup?.nativeElement;
    if (!container || !group) return;

    const groupWidth = group.getBoundingClientRect().width;
    // Set scrolling state if contents exceed visible horizontal layouts
    this.shouldScroll = groupWidth > container.clientWidth + 1;
  }

  private async prepareTrimmedLogos(urls: string[]): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !Array.isArray(urls) || urls.length === 0) {
      this.trimmedLogoMap = {};
      return;
    }

    const currentRun = ++this.trimRunId;
    const uniqueUrls = Array.from(new Set(urls.filter((u) => typeof u === 'string' && u.trim().length > 0)));
    const results = await Promise.all(uniqueUrls.map((url) => this.trimTransparentPadding(url)));

    if (currentRun !== this.trimRunId) return;

    const nextMap: Record<string, string> = {};
    uniqueUrls.forEach((url, idx) => {
      nextMap[url] = results[idx];
    });
    this.trimmedLogoMap = nextMap;
    this.queueMeasure();
  }

  private trimTransparentPadding(url: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          if (!w || !h) return resolve(url);

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return resolve(url);

          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0);

          const data = ctx.getImageData(0, 0, w, h).data;
          let minX = w, minY = h, maxX = -1, maxY = -1;

          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const alpha = data[(y * w + x) * 4 + 3];
              if (alpha > 8) { // Transparency detection boundary threshold
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
              }
            }
          }

          if (maxX < minX || maxY < minY) return resolve(url);

          const cropW = maxX - minX + 1;
          const cropH = maxY - minY + 1;
          const cropped = document.createElement('canvas');
          const croppedCtx = cropped.getContext('2d');
          if (!croppedCtx) return resolve(url);

          cropped.width = cropW;
          cropped.height = cropH;
          croppedCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
          resolve(cropped.toDataURL('image/png'));
        } catch {
          resolve(url);
        }
      };

      img.onerror = () => resolve(url);
      img.src = url;
    });
  }
}