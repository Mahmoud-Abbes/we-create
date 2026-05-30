import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProjectSidebarDTO {
  slug: string;
}

export interface ProjectViewDetailsDTO {
  id: string;
  subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIAL';
  planType: 'SUBSCRIPTION' | 'THREE_MONTHS' | 'ONE_MONTH';
  planDate: string | null; // ISO string from LocalDateTime (period end)
  deployable: boolean;
  isOwner: boolean;
  collaborators: { username: string; role: 'OWNER' | 'COLLABORATOR' }[];
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = environment.apiUrl;
  private readonly sidebarRefreshSubject = new Subject<void>();
  readonly sidebarRefresh$ = this.sidebarRefreshSubject.asObservable();

  constructor(private http: HttpClient) {}

  notifySidebarRefresh(): void {
    this.sidebarRefreshSubject.next();
  }

  getSidebarProjects(): Observable<ProjectSidebarDTO[]> {
    return this.http.get<ProjectSidebarDTO[]>(`${this.apiUrl}/projects/sidebar`);
  }

  // Added method call matching Nginx clean tracking style
  getProjectViewDetails(slug: string): Observable<ProjectViewDetailsDTO> {
    return this.http.get<ProjectViewDetailsDTO>(`${this.apiUrl}/view-details?slug=${slug}`);
  }
}