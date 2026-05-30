import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface GenerateCollaboratorLinkResponse {
  inviteKey: string;
  slug: string;
}

@Injectable({
  providedIn: 'root',
})
export class CollaboratorService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  generateCollaboratorLink(slug: string): Observable<GenerateCollaboratorLinkResponse> {
    return this.http.post<GenerateCollaboratorLinkResponse>(
      `${this.apiUrl}/generateCollaboratorLink`,
      { slug }
    );
  }

  addCollaborator(inviteKey: string, slug: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/addCollaborator`, {
      inviteKey,
      slug,
    });
  }

  buildInviteUrl(slug: string, inviteKey: string): string {
    return `${window.location.origin}/view/${encodeURIComponent(slug)}?invite=${encodeURIComponent(inviteKey)}`;
  }
}
