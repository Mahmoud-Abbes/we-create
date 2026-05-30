import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { PreviewTokenService } from '../../services/Preview/preview-token.service';
import { toast } from 'ngx-sonner';
import { ProjectService } from '../../services/projects/project.service';
import { CollaboratorService } from '../../services/api/collaborator/collaborator.service';

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIAL';
export type PlanType = 'SUBSCRIPTION' | 'THREE_MONTHS' | 'ONE_MONTH';

export interface Collaborator {
  username: string;
  role: 'OWNER' | 'COLLABORATOR';
}

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
  collaboratorsOpen = false;
  accessGranted = false;
  bootstrapping = true;

  subscriptionStatus: SubscriptionStatus = 'ACTIVE';
  planType: PlanType = 'SUBSCRIPTION';
  planDate: Date | null = null;
  deployable = true;
  collaborators: Collaborator[] = [];
  isOwner = false;
  copyLinkLoading = false;
  private inviteHandled = false;
  planDateLabel: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tokenService: PreviewTokenService,
    private projectService: ProjectService,
    private collaboratorService: CollaboratorService,
    private sanitizer: DomSanitizer
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.collab-wrapper')) {
      this.collaboratorsOpen = false;
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.projectSlug = params.get('slug') ?? '';
      this.inviteHandled = false;
      this.resetViewState();

      if (!this.projectSlug) {
        this.redirectToWelcome('Link unavailable');
        return;
      }

      this.bootstrapView();
    });

    this.route.queryParams.subscribe(params => {
      if (params['payment'] === 'success' && this.accessGranted) {
        toast.success('Payment successful! Your project has been activated.');
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { payment: null },
          queryParamsHandling: 'merge',
        });
      }
    });
  }

  private resetViewState(): void {
    this.accessGranted = false;
    this.bootstrapping = true;
    this.safeUrl = undefined;
    this.collaboratorsOpen = false;
    this.isOwner = false;
    this.collaborators = [];
  }

  private bootstrapView(): void {
    const inviteKey = this.route.snapshot.queryParamMap.get('invite');
    if (inviteKey && !this.inviteHandled) {
      this.inviteHandled = true;
      this.collaboratorService.addCollaborator(inviteKey, this.projectSlug).subscribe({
        next: () => {
          toast.success('You have been added as a collaborator');
          this.projectService.notifySidebarRefresh();
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { invite: null },
            queryParamsHandling: 'merge',
          });
          this.loadProjectAccessAndPreview();
        },
        error: () => this.redirectToWelcome('Invalid or expired invite link'),
      });
      return;
    }

    this.loadProjectAccessAndPreview();
  }

  private loadProjectAccessAndPreview(): void {
    this.projectService.getProjectViewDetails(this.projectSlug).subscribe({
      next: (data) => {
        this.subscriptionStatus = data.subscriptionStatus as SubscriptionStatus;
        this.planType = data.planType;
        this.planDate = data.planDate ? new Date(data.planDate) : null;
        this.deployable = data.deployable;
        this.isOwner = data.isOwner;
        this.collaborators = data.collaborators;
        this.planDateLabel = this.buildPlanDateLabel(
          this.planType,
          this.subscriptionStatus,
          this.planDate
        );
        this.accessGranted = true;
        this.bootstrapping = false;
        this.loadPreview();
      },
      error: (err) => {
        const message =
          err?.status === 403 || err?.status === 404
            ? 'Link unavailable'
            : 'Could not load project';
        this.redirectToWelcome(message);
      },
    });
  }

  private redirectToWelcome(message: string): void {
    this.bootstrapping = false;
    this.accessGranted = false;
    this.safeUrl = undefined;
    toast.error(message);
    this.router.navigate(['/welcome']);
  }

  buildPlanDateLabel(
    planType: PlanType,
    status: SubscriptionStatus,
    date: Date | null
  ): string {
    if (!date) {
      return '';
    }
    const formatted = this.formatPlanDate(date);
    const hasPassed = new Date() > date;

    if (hasPassed) {
      return `Subscription ended at <span class="plan-date-value">${formatted}</span>`;
    }

    if (status === 'CANCELED') {
      return `Plan canceled · access until <span class="plan-date-value">${formatted}</span>`;
    }
    if (planType === 'SUBSCRIPTION') {
      return `Subscription renews at <span class="plan-date-value">${formatted}</span>`;
    }
    return `Subscription ends at <span class="plan-date-value">${formatted}</span>`;
  }

  formatPlanDate(date: Date): string {
    const datePart = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${datePart} · ${timePart}`;
  }

  getInitials(username: string): string {
    return username ? username.charAt(0).toUpperCase() : '';
  }

  get isPeriodActive(): boolean {
    if (this.planDate) {
      return new Date() < this.planDate;
    }
    return this.subscriptionStatus === 'ACTIVE';
  }

  get showAccessHint(): boolean {
    return (
      this.subscriptionStatus !== 'TRIAL' &&
      this.isPeriodActive &&
      this.deployable &&
      !!this.projectSlug
    );
  }

  get showExpiredHint(): boolean {
    return this.subscriptionStatus !== 'TRIAL' && !this.isPeriodActive;
  }

  loadPreview(): void {
    if (!this.accessGranted) {
      return;
    }

    this.safeUrl = undefined;
    this.tokenService.getBurnerToken(this.projectSlug).subscribe({
      next: (res: { previewToken: string }) => {
        const rawUrl = `${window.location.origin}/${this.projectSlug}?previewToken=${res.previewToken}&origin=dashboard`;
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
      },
      error: (err) => {
        console.error('Burner Token acquisition failed:', err);
        if (err?.status === 403 || err?.status === 404) {
          this.redirectToWelcome('Link unavailable');
        }
      },
    });
  }

  goToPayment(): void {
    if (!this.isOwner) {
      return;
    }
    this.router.navigate(['/billing', this.projectSlug]);
  }

  getLiveUrl(): string {
    return `${window.location.origin}/${this.projectSlug}`;
  }

  copyCollaboratorLink(): void {
    if (!this.isOwner || this.copyLinkLoading || !this.projectSlug) {
      return;
    }

    this.copyLinkLoading = true;
    this.collaboratorService.generateCollaboratorLink(this.projectSlug).subscribe({
      next: (res) => {
        const link = this.collaboratorService.buildInviteUrl(res.slug, res.inviteKey);
        navigator.clipboard.writeText(link).then(
          () => toast.success('Collaborator link copied to clipboard'),
          () => toast.error('Could not copy link to clipboard')
        );
        this.copyLinkLoading = false;
      },
      error: (err) => {
        console.error('Failed to generate collaborator link:', err);
        toast.error(err?.error?.error ?? 'Failed to generate collaborator link');
        this.copyLinkLoading = false;
      },
    });
  }
}
