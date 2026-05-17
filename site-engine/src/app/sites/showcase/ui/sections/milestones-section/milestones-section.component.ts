import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-milestones-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './milestones-section.component.html',
  styleUrl: './milestones-section.component.scss',
})
export class MilestonesSectionComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() content: any; // Handed down by HomePageEngine

  displayValues: string[] = [];
  private rafIds: number[] = [];
  private hasAnimated = false;
  private observer?: IntersectionObserver;

  @ViewChild('milestonesSection') milestonesSection?: ElementRef<HTMLElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content'] && this.content) {
      const items = this.content.items || [];
      // If already animated once, stick to the final values instead of resetting to 0
      if (this.hasAnimated) {
        this.displayValues = items.map((item: any) => `${item?.value ?? ''}`);
      } else {
        this.displayValues = items.map(() => '0');
      }
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || !this.milestonesSection) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        const entered = entries.some((entry) => entry.isIntersecting);
        if (!entered || this.hasAnimated) return;
        this.startCountUp();
      },
      { threshold: 0.25 }
    );

    this.observer.observe(this.milestonesSection.nativeElement);
  }

  resolveBackground(): string {
    const appearance = this.content?.appearance;
    if (!appearance || !appearance.colors) return 'transparent';

    const { colors, gradientParams } = appearance;
    if (colors.color1 && colors.color2 && gradientParams) {
      return `linear-gradient(${gradientParams.angle}, ${colors.color1} ${gradientParams.color1Stop}, ${colors.color2} ${gradientParams.color2Stop})`;
    }
    return colors.color1 || 'transparent';
  }

  private startCountUp(): void {
    const items = this.content?.items || [];
    if (this.hasAnimated || !items.length) return;
    this.cancelAnimations();

    const duration = 1700;
    const start = performance.now();

    items.forEach((item: any, index: number) => {
      const target = this.parseNumericValue(item?.value);
      if (target === null) {
        this.displayValues[index] = `${item?.value ?? ''}`;
        return;
      }

      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Cubic Ease-Out
        this.displayValues[index] = `${Math.round(target * eased)}`;

        if (progress < 1) {
          this.rafIds[index] = requestAnimationFrame(animate);
        } else {
          this.displayValues[index] = `${Math.round(target)}`;
        }
      };

      this.rafIds[index] = requestAnimationFrame(animate);
    });

    this.hasAnimated = true;
  }

  private parseNumericValue(value: any): number | null {
    if (value === null || value === undefined) return null;
    const n = Number(String(value).replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : null;
  }

  private cancelAnimations(): void {
    this.rafIds.forEach((id) => cancelAnimationFrame(id));
    this.rafIds = [];
  }

  ngOnDestroy(): void {
    this.cancelAnimations();
    this.observer?.disconnect();
  }
}