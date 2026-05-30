import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { InvoiceResponse } from '../payment/payment.service';

export interface InvoicesAndDeploymentResponse {
  invoices: InvoiceResponse[];
  deployable: boolean;
  subscriptionStatus: string;
  billingPlan: string | null;
  periodEndAt: string | null;
  projectSlug: string;
}

@Injectable({
  providedIn: 'root',
})
export class InvoicesAndDeploymentService {
  private readonly baseUrl = `${environment.apiUrl}/invoices-deployment`;

  constructor(private http: HttpClient) {}

  getForProject(slug: string): Observable<InvoicesAndDeploymentResponse> {
    return this.http.get<InvoicesAndDeploymentResponse>(`${this.baseUrl}/${slug}`);
  }

  setDeployable(slug: string, deployable: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${slug}/deployable`, { deployable });
  }
}
