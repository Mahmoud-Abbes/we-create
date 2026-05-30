import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { PaymentComponent } from './payment/payment.component';
import { SubscriptionManagementComponent } from './subscription-management/subscription-management.component';
import { ProjectService } from '../../services/projects/project.service';

type BillingTab = 'payment' | 'subscription';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, PaymentComponent, SubscriptionManagementComponent],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss'
})
export class BillingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);

  projectSlug = '';
  activeTab: BillingTab = 'payment';
  subscriptionStatus = '';

  get isTrial(): boolean {
    return this.subscriptionStatus === 'TRIAL';
  }

  get isSubscriptionTabDisabled(): boolean {
    return !this.subscriptionStatus || this.isTrial;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.projectSlug = params.get('slug') ?? '';
      if (this.projectSlug) {
        this.loadSubscriptionStatus();
      }
    });
  }

  private loadSubscriptionStatus(): void {
    this.projectService.getProjectViewDetails(this.projectSlug).subscribe({
      next: (data) => {
        if (!data.isOwner) {
          toast.error('Link unavailable');
          this.router.navigate(['/welcome']);
          return;
        }
        this.subscriptionStatus = data.subscriptionStatus;
        if (this.isTrial && this.activeTab === 'subscription') {
          this.activeTab = 'payment';
        }
      },
      error: (err) => {
        const message =
          err?.status === 403 || err?.status === 404
            ? 'Link unavailable'
            : 'Could not load billing';
        toast.error(message);
        this.router.navigate(['/welcome']);
      },
    });
  }

  switchTab(tab: BillingTab): void {
    if (tab === 'subscription' && this.isSubscriptionTabDisabled) {
      return;
    }
    this.activeTab = tab;
  }
}