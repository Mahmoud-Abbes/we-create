import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar.component';
import { SelectionComponent } from './components/selection/selection.component';
import { Router } from '@angular/router';
import { IdentityComponent } from './components/showcase/identity/identity.component';
import { ReachComponent } from './components/showcase/reach/reach.component';
import { ThemeComponent } from './components/showcase/theme/theme.component';
import { PartnersComponent } from './components/showcase/partners/partners.component';
import { MilestonesComponent } from './components/showcase/milestones/milestones.component';
import { ServicesComponent } from './components/showcase/services/services.component';
import { TestimonialsComponent } from './components/showcase/testimonials/testimonials.component';
import { AboutComponent } from "./components/showcase/about/about.component";

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    SelectionComponent,
    IdentityComponent,
    ReachComponent,
    ThemeComponent,
    PartnersComponent,
    MilestonesComponent,
    ServicesComponent,
    TestimonialsComponent,
    AboutComponent
],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollHost') private scrollHost?: ElementRef<HTMLDivElement>;
  @ViewChild('scrollTrack') private scrollTrack?: ElementRef<HTMLDivElement>;

  sidebarCollapsed = false;
  showScrollbar = false;
  thumbHeight = 96;
  thumbTop = 0;

  constructor(private router: Router) { }

  currentStep = 1;
  selectedType: 'showcase' | 'ecommerce' | null = null;

  private readonly minThumbHeight = 96;
  private isDraggingThumb = false;
  private dragStartY = 0;
  private dragStartScrollTop = 0;
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;
  private readonly onDocumentMouseMove = (event: MouseEvent) => this.handleDocumentMouseMove(event);
  private readonly onDocumentMouseUp = () => this.stopThumbDrag();

  ngAfterViewInit(): void {
    this.queueScrollbarUpdate();
    const host = this.scrollHost?.nativeElement;
    if (!host) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => this.updateScrollbar());
    this.resizeObserver.observe(host);
    this.mutationObserver = new MutationObserver(() => this.queueScrollbarUpdate());
    this.mutationObserver.observe(host, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
  }

  selectType(type: 'showcase' | 'ecommerce') {
    this.selectedType = type;
    this.queueScrollbarUpdate();
  }

  onSidebarCollapsedChange(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
    this.queueScrollbarUpdate();
  }

  nextStep() {
    const maxStep = this.selectedType === 'showcase' ? 9 : 2;
    if (this.currentStep < maxStep) {
      this.currentStep++;
    }
    this.queueScrollbarUpdate();
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
    this.queueScrollbarUpdate();
  }

  redirect() {
    if (this.selectedType === null) {
      this.router.navigate(['/create']);
    }
  }

  onScrollHost(): void {
    this.updateScrollbar();
  }

  onTrackMouseDown(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('custom-scrollbar__thumb')) {
      return;
    }

    const host = this.scrollHost?.nativeElement;
    const track = this.scrollTrack?.nativeElement;
    if (!host || !track) {
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const clickOffsetY = event.clientY - trackRect.top;
    const desiredThumbTop = clickOffsetY - this.thumbHeight / 2;
    const maxThumbTop = Math.max(0, track.clientHeight - this.thumbHeight);
    const clampedThumbTop = Math.min(Math.max(0, desiredThumbTop), maxThumbTop);
    const scrollRatio = maxThumbTop === 0 ? 0 : clampedThumbTop / maxThumbTop;
    const maxScrollTop = host.scrollHeight - host.clientHeight;
    host.scrollTop = scrollRatio * maxScrollTop;
    this.updateScrollbar();
  }

  onThumbMouseDown(event: MouseEvent): void {
    event.preventDefault();
    const host = this.scrollHost?.nativeElement;
    if (!host || !this.showScrollbar) {
      return;
    }

    this.isDraggingThumb = true;
    this.dragStartY = event.clientY;
    this.dragStartScrollTop = host.scrollTop;

    document.addEventListener('mousemove', this.onDocumentMouseMove);
    document.addEventListener('mouseup', this.onDocumentMouseUp);
  }

  private handleDocumentMouseMove(event: MouseEvent): void {
    if (!this.isDraggingThumb) {
      return;
    }

    const host = this.scrollHost?.nativeElement;
    const track = this.scrollTrack?.nativeElement;
    if (!host || !track) {
      return;
    }

    const maxThumbTop = Math.max(0, track.clientHeight - this.thumbHeight);
    const maxScrollTop = Math.max(0, host.scrollHeight - host.clientHeight);
    if (maxThumbTop === 0 || maxScrollTop === 0) {
      return;
    }

    const deltaY = event.clientY - this.dragStartY;
    const scrollDelta = (deltaY / maxThumbTop) * maxScrollTop;
    host.scrollTop = this.dragStartScrollTop + scrollDelta;
    this.updateScrollbar();
  }

  private stopThumbDrag(): void {
    this.isDraggingThumb = false;
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
  }

  private updateScrollbar(): void {
    const host = this.scrollHost?.nativeElement;
    if (!host) {
      return;
    }

    const hasOverflow = host.scrollHeight > host.clientHeight + 1;
    if (this.showScrollbar !== hasOverflow) {
      this.showScrollbar = hasOverflow;
      if (hasOverflow) {
        // The track is conditionally rendered; compute thumb on next tick.
        this.queueScrollbarUpdate();
      }
    }

    if (!hasOverflow) {
      this.thumbTop = 0;
      return;
    }

    const track = this.scrollTrack?.nativeElement;
    if (!track) {
      return;
    }

    const trackHeight = track.clientHeight;
    const maxScrollTop = host.scrollHeight - host.clientHeight;
    this.thumbHeight = Math.max(
      this.minThumbHeight,
      Math.round((host.clientHeight / host.scrollHeight) * trackHeight),
    );
    const maxThumbTop = Math.max(0, trackHeight - this.thumbHeight);
    const scrollRatio = maxScrollTop === 0 ? 0 : host.scrollTop / maxScrollTop;
    this.thumbTop = Math.round(scrollRatio * maxThumbTop);
  }

  private queueScrollbarUpdate(): void {
    setTimeout(() => this.updateScrollbar(), 0);
  }
}
