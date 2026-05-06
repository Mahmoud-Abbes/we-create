import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Project {
  name: string;
  isFavorite: boolean;
  dateCreated: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  fetchProjects(): Observable<Project[]> {
    return of([
      { name: 'E-commerce', isFavorite: true, dateCreated: new Date('2024-01-15') },
      { name: 'Vitrine', isFavorite: false, dateCreated: new Date('2024-03-02') },
      { name: 'E-commerce', isFavorite: false, dateCreated: new Date('2024-05-20') },
    ]);
  }
}