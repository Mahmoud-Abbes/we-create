import { Component, Input, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { toast } from 'ngx-sonner';

import { InvoiceResponse, PaymentService } from '../../../services/api/payment/payment.service';

import {
  InvoicesAndDeploymentService,
  InvoicesAndDeploymentResponse,
} from '../../../services/api/billing/invoices-and-deployment.service';

import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-subscription-management',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './subscription-management.component.html',

  styleUrl: './subscription-management.component.scss',
})
export class SubscriptionManagementComponent implements OnInit {
  @Input() slug = '';

  private readonly invoicesDeploymentService = inject(InvoicesAndDeploymentService);

  private readonly paymentService = inject(PaymentService);

  private readonly confirmDialog = inject(ConfirmDialogService);

  invoices: InvoiceResponse[] = [];

  deployable = true;

  subscriptionStatus = '';

  billingPlan: string | null = null;

  periodEndAt: string | null = null;

  loading = true;

  loadError = false;

  togglingDeployment = false;

  cancellingSubscription = false;

  get isRecurringSubscription(): boolean {
    return this.billingPlan === 'SUBSCRIPTION';
  }

  get canCancelSubscription(): boolean {
    return this.isRecurringSubscription && this.subscriptionStatus !== 'CANCELED';
  }

  /** Paid access window still open (includes cancelled subs until period end). */

  get isPeriodActive(): boolean {
    if (this.periodEndAt) {
      return new Date() < new Date(this.periodEndAt);
    }

    return this.subscriptionStatus === 'ACTIVE';
  }

  get canShowLiveSiteAccess(): boolean {
    return this.isPeriodActive && this.deployable && !!this.slug;
  }

  get canShowRedeployHint(): boolean {
    return this.isPeriodActive && !this.deployable && !!this.slug;
  }

  get liveSiteUrl(): string {
    return `${window.location.origin}/${this.slug}`;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (!this.slug) {
      this.loading = false;

      this.loadError = true;

      return;
    }

    this.loading = true;

    this.loadError = false;

    this.invoicesDeploymentService.getForProject(this.slug).subscribe({
      next: (data: InvoicesAndDeploymentResponse) => {
        this.invoices = data.invoices;

        this.deployable = data.deployable;

        this.subscriptionStatus = data.subscriptionStatus;

        this.billingPlan = data.billingPlan;

        this.periodEndAt = data.periodEndAt;

        this.loading = false;
      },

      error: () => {
        this.loadError = true;

        this.loading = false;
      },
    });
  }

  async onCancelSubscription(): Promise<void> {
    if (!this.slug || !this.canCancelSubscription) {
      return;
    }

    const confirmed = await this.confirmDialog.confirm({
      title: 'Cancel subscription?',

      message:
        'Auto-renewal will stop. Your site stays online until the end of the current billing period.',

      confirmLabel: 'Cancel subscription',

      cancelLabel: 'Keep subscription',

      variant: 'danger',
    });

    if (!confirmed) {
      return;
    }

    this.cancellingSubscription = true;

    this.paymentService.cancelSubscription(this.slug).subscribe({
      next: () => {
        this.subscriptionStatus = 'CANCELED';

        this.cancellingSubscription = false;

        toast.success('Subscription cancelled. Access continues until period end.');
      },

      error: (err) => {
        this.cancellingSubscription = false;

        toast.error(err.error?.message || 'Could not cancel subscription.');
      },
    });
  }

  async onToggleDeployment(): Promise<void> {
    if (!this.slug) {
      return;
    }

    const nextDeployable = !this.deployable;

    const confirmed = await this.confirmDialog.confirm(
      nextDeployable
        ? {
            title: 'Deploy site?',

            message: 'Your site will be publicly accessible on the internet at its live URL.',

            confirmLabel: 'Deploy site',

            cancelLabel: 'Not now',

            variant: 'primary',
          }
        : {
            title: 'Undeploy site?',

            message:
              'Visitors will no longer reach the live instance. You can deploy again anytime while your plan is active.',

            confirmLabel: 'Undeploy site',

            cancelLabel: 'Keep live',

            variant: 'danger',
          },
    );

    if (!confirmed) {
      return;
    }

    this.togglingDeployment = true;

    this.invoicesDeploymentService.setDeployable(this.slug, nextDeployable).subscribe({
      next: () => {
        this.deployable = nextDeployable;

        this.togglingDeployment = false;

        toast.success(nextDeployable ? 'Site deployed.' : 'Site undeployed.');
      },

      error: () => {
        this.togglingDeployment = false;

        toast.error(nextDeployable ? 'Could not deploy site.' : 'Could not undeploy site.');
      },
    });
  }

  formatBillingPlan(plan: string | null): string {
    if (!plan) return '—';

    return plan

      .toLowerCase()

      .split('_')

      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))

      .join(' ');
  }

  formatAmount(amount: number, currency: string): string {
    const value = amount / 100;

    return new Intl.NumberFormat(undefined, {
      style: 'currency',

      currency: currency.toUpperCase(),
    }).format(value);
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';

    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',

      month: 'short',

      day: 'numeric',
    });
  }
}
