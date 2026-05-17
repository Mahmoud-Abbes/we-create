import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, NgZone, PLATFORM_ID, Input, OnInit, OnDestroy, inject } from '@angular/core';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
})
export class AboutSectionComponent implements OnInit, OnDestroy {
  @Input() content: any; // Handed down by HomePageEngine

  currentSlide = 0;
  disableSlideTransition = false;
  intervalId: any;

  private zone = inject(NgZone);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    const imageCount = Array.isArray(this.content?.images) ? this.content.images.length : 0;
    
    if (isPlatformBrowser(this.platformId) && imageCount > 1) {
      this.startCarousel(imageCount, this.content?.layoutType === 'images-background');
    }
  }

  private startCarousel(length: number, isBackgroundLayout: boolean) {
    if (this.intervalId) clearInterval(this.intervalId);

    this.zone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.zone.run(() => {
          if (isBackgroundLayout) {
            this.currentSlide = (this.currentSlide + 1) % length;
            return;
          }

          this.currentSlide += 1;

          // Infinite loop logic: After the cloned first slide, snap back
          if (this.currentSlide >= length) {
            setTimeout(() => {
              this.disableSlideTransition = true;
              this.currentSlide = 0;
              setTimeout(() => {
                this.disableSlideTransition = false;
              }, 30);
            }, 1200); // Wait for the transition to finish
          }
        });
      }, 5000);
    });
  }

  getCarouselImages(images: string[] | undefined): string[] {
    if (!Array.isArray(images) || images.length === 0) return [];
    if (images.length === 1) return images;
    // Clone first image at the end for smooth infinite scrolling
    return [...images, images[0]];
  }

  resolveBackground(): string {
    const appearance = this.content?.appearance;
    if (!appearance || !appearance.colors) return 'var(--background)';

    const { colors, gradientParams } = appearance;
    if (colors.color1 && colors.color2 && gradientParams) {
      return `linear-gradient(${gradientParams.angle}, ${colors.color1} ${gradientParams.color1Stop}, ${colors.color2} ${gradientParams.color2Stop})`;
    }
    return colors.color1 || 'var(--background)';
  }

  resolveLayoutClasses(): string {
    if (!this.content?.images || this.content.images.length === 0) return 'no-images-attached';
    const flowClass = this.content.isImageFlowing ? 'is-flowing' : 'full-height';
    return `${this.content.layoutType} ${flowClass}`;
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}