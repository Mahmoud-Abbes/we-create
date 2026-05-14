import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectPublicDTO } from '../models/project-dto.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // This matches your backend secret switch
  private readonly ENGINE_KEY = 'uqsdf57fq5s-internal-key';

  constructor(private http: HttpClient) {}

  getProjectData(slug: string, previewToken?: string, origin?: string): Observable<ProjectPublicDTO> {
    const headers = new HttpHeaders({
      'X-WeCreate-Engine-Key': this.ENGINE_KEY
    });

    let params = new HttpParams();
    if (previewToken) params = params.set('previewToken', previewToken);
    if (origin) params = params.set('origin', origin);

    return this.http.get<ProjectPublicDTO>(`http://localhost/api/public/projects/${slug}`, { headers, params });
  }
}