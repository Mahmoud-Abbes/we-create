import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ProjectPublicDTO } from '../models/project-dto.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly ENGINE_KEY = 'uqsdf57fq5s-internal-key';
  
  private _siteData$ = new BehaviorSubject<ProjectPublicDTO | null>(null);
  siteData$ = this._siteData$.asObservable();

  constructor(private http: HttpClient) {}

  getProjectData(slug: string, previewToken?: string, origin?: string): Observable<ProjectPublicDTO> {
    const headers = new HttpHeaders({ 'X-WeCreate-Engine-Key': this.ENGINE_KEY });
    let params = new HttpParams();
    if (previewToken) params = params.set('previewToken', previewToken);
    if (origin) params = params.set('origin', origin);

    return this.http.get<ProjectPublicDTO>(`http://localhost/api/public/projects/${slug}`, { headers, params })
      .pipe(
        tap((data) => {
          if (data) {
            if (typeof data.jsonContent === 'string') {
              try {
                data.jsonContent = JSON.parse(data.jsonContent);
              } catch (e) {
                console.error('Failed to parse jsonContent string', e);
              }
            }
            if (data.projectType) {
              data.projectType = data.projectType.toLowerCase() as ProjectPublicDTO['projectType'];
            }
          }
          this._siteData$.next(data);
        })
      );
  }

  clearRAM() {
    this._siteData$.next(null);
  }
}