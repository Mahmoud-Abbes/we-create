import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, NgZone, Input, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ProjectService } from '../../../../../api/project.service';

@Component({
  selector: 'app-hero-bold',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-bold.component.html',
  styleUrl: './hero-bold.component.scss',
})
export class HeroBoldComponent implements OnInit, OnDestroy {
  @Input() content: any; // Received from HomePageEngine

  identity$: Observable<any>;
  currentSlide = 0;
  intervalId: any;

  private projectService = inject(ProjectService);
  private elementRef = inject(ElementRef<HTMLElement>);
  private zone = inject(NgZone);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Identity is needed for the Company Name and Slogan
    this.identity$ = this.projectService.siteData$.pipe(
      map((d) => d?.jsonContent?.identity)
    );
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startImageTimer();
    }
  }

  private startImageTimer() {
    if (this.content?.images && this.content.images.length > 1) {
      this.intervalId = setInterval(() => {
        this.zone.run(() => {
          this.currentSlide = (this.currentSlide + 1) % this.content.images.length;
        });
      }, 5000);
    }
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  getBackground() {
    const bg = this.content?.backgroundColors;
    const p = this.content?.gradientParams;
    if (!bg) return 'white';

    if (bg.color1 && bg.color2) {
      return `linear-gradient(${p?.angle || '160deg'}, ${bg.color1} ${p?.color1Stop || '0%'}, ${bg.color2} ${p?.color2Stop || '100%'})`;
    }
    return bg.color1 || 'white';
  }

  shouldShowGrain(): boolean {
    const hasGradient = !!this.content?.backgroundColors?.color2;
    const isGrainEnabled = !!this.content?.grainy;
    const hasBackgroundImages = this.content?.layoutType === 'images-background' && this.content?.images?.length > 0;

    return isGrainEnabled && hasGradient && !hasBackgroundImages;
  }

  scrollToNextSection(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const host = this.elementRef.nativeElement;
    let next = host.nextElementSibling as HTMLElement | null;

    // Search for next sibling that isn't an empty ng-container/comment
    while (next && (next.childElementCount === 0 || next.tagName === 'NG-CONTAINER')) {
      next = next.nextElementSibling as HTMLElement | null;
    }

    if (!next) return;

    const rootStyles = getComputedStyle(document.documentElement);
    const headerHeightVar = rootStyles.getPropertyValue('--app-header-height').trim() || '5.5rem';
    
    const headerHeight = this.toPx(headerHeightVar);
    const comfortGap = 12;
    const targetTop = window.scrollY + next.getBoundingClientRect().top - headerHeight - comfortGap;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    });
  }

  private toPx(value: string): number {
    if (!value) return 0;
    if (value.endsWith('px')) return parseFloat(value);
    if (value.endsWith('rem')) {
      return parseFloat(value) * 16; // Standard fallback
    }
    return parseFloat(value) || 0;
  }
}