import { Component, HostListener, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialCardComponent } from '../../components/testimonial-card/testimonial-card.component';

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  imports: [CommonModule, TestimonialCardComponent],
  templateUrl: './testimonails-section.component.html',
  styleUrl: './testimonails-section.component.scss',
  encapsulation: ViewEncapsulation.None // Safeguards flex tracks and slide math transforms
})

export class TestimonialsSectionComponent implements OnInit {
  @Input() content: any; // Passed down from HomePageEngine

  currentIndex = 0;
  visibleCards = 3;
  isTransitioning = false;
  readonly transitionMs = 450;

  ngOnInit(): void {
    this.updateVisibleCards();
  }

  resolveBackground(): string {
    const appearance = this.content?.appearance;
    if (!appearance?.colors) return 'transparent';
    const { colors, gradientParams } = appearance;
    
    if (colors.color1 && colors.color2) {
      return `linear-gradient(${gradientParams?.angle || '180deg'}, ${colors.color1} ${gradientParams?.color1Stop || '0%'}, ${colors.color2} ${gradientParams?.color2Stop || '100%'})`;
    }
    return colors.color1 || 'transparent';
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateVisibleCards();
  }

  updateVisibleCards(): void {
    if (typeof window === 'undefined') return;
    const width = window.innerWidth;
    if (width <= 768) {
      this.visibleCards = 1;
    } else if (width <= 1024) {
      this.visibleCards = 2;
    } else {
      this.visibleCards = 3;
    }
  }

  getTrackTransform(itemsLength: number): string {
    const clamped = this.getClampedIndex(itemsLength);
    return `translateX(calc(-${clamped} * (100% + 1.5rem) / ${this.visibleCards}))`;
  }

  shouldCenterItems(itemsLength: number): boolean {
    return itemsLength > 0 && itemsLength <= this.visibleCards;
  }

  canGoPrev(): boolean {
    return this.currentIndex > 0;
  }

  canGoNext(itemsLength: number): boolean {
    return this.currentIndex + this.visibleCards < itemsLength;
  }

  goPrev(): void {
    if (this.isTransitioning || !this.canGoPrev()) return;
    this.isTransitioning = true;
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    this.unlockAfterTransition();
  }

  goNext(itemsLength: number): void {
    if (this.isTransitioning || !this.canGoNext(itemsLength)) return;
    this.isTransitioning = true;
    this.currentIndex = Math.min(itemsLength - this.visibleCards, this.currentIndex + 1);
    this.unlockAfterTransition();
  }

  private getClampedIndex(itemsLength: number): number {
    const maxStart = Math.max(0, itemsLength - this.visibleCards);
    if (this.currentIndex > maxStart) {
      this.currentIndex = maxStart;
    }
    return this.currentIndex;
  }

  private unlockAfterTransition(): void {
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.transitionMs);
  }
}