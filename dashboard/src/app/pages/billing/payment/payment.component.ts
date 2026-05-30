import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import { CheckoutRequest, PaymentService } from '../../../services/api/payment/payment.service';
import { ProjectService } from '../../../services/projects/project.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit {
  @Input() slug: string = '';
  projectId: string = ''; // Tracks the required DB UUID matching the slug context
  isLoading: boolean = false;

  constructor(
    private paymentService: PaymentService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    if (this.slug) {
      // 1. Fetch project details to grab the UUID string ('id') from your backend
      this.projectService.getProjectViewDetails(this.slug).subscribe({
        next: (data) => {
          this.projectId = data.id;
        },
        error: () => {
          toast.error('Could not load project details. Please refresh and try again.');
        },
      });
    }
  }

  selectPlan(planType: 'SUBSCRIPTION' | 'THREE_MONTHS' | 'ONE_MONTH'): void {
    if (!this.projectId) {
      toast.error('Project is still loading. Please wait a moment and try again.');
      return;
    }

    this.isLoading = true;

    const payload: CheckoutRequest = {
      projectId: this.projectId,
      planType: planType
    };

    // 2. Dispatch request to Spring Boot backend controller endpoint
    this.paymentService.createCheckoutSession(payload).subscribe({
      next: (response) => {
        // 🚀 Redirect the browser window straight out to Stripe's secure hosted payment form
        window.location.href = response.url;
      },
      error: (err) => {
        this.isLoading = false;
        const message =
          err.error?.error || err.error?.message || 'Could not start checkout. Please try again.';
        toast.error(message);
      },
    });
  }
}