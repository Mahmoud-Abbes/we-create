import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CheckoutRequest {
  projectId: string; // The project ID mapped from your route or state management
  planType: 'SUBSCRIPTION' | 'THREE_MONTHS' | 'ONE_MONTH';
}

export interface CheckoutResponse {
  url: string; // The target Stripe secure checkout routing link
}

export interface InvoiceResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  hostedPdfUrl: string | null;
  stripeInvoiceId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  // Mind the controller path context mapping omission here
  private baseUrl = `${environment.apiUrl}/payments`; 

  constructor(private http: HttpClient) {}

  /**
   * Knocks on your Spring Boot Controller to generate a secure Stripe Checkout layer
   */
  createCheckoutSession(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.baseUrl}/checkout`, request);
  }

  listInvoices(): Observable<InvoiceResponse[]> {
    return this.http.get<InvoiceResponse[]>(`${this.baseUrl}/invoices`);
  }

  cancelSubscription(slug: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${slug}/cancel-subscription`, null);
  }
}