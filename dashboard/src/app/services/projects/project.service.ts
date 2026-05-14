import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProjectSidebarDTO {
  slug: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) {}

  getSidebarProjects(): Observable<ProjectSidebarDTO[]> {
    return this.http.get<ProjectSidebarDTO[]>(`${this.apiUrl}/projects/sidebar`);
  }
}