import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PreviewTokenService {
  constructor(private http: HttpClient) {}

  // Calls an authenticated endpoint on your backend to get a burner token
  getBurnerToken(slug: string): Observable<{previewToken: string}> {
    return this.http.post<{previewToken: string}>(`${environment.apiUrl}/projects/${slug}/preview-token`, {});
  }
}