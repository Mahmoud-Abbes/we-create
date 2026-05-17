import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ProjectService } from '../../../../api/project.service';
import { FloatingIslandHeaderComponent } from '../../ui/headers/floating-island-header/floating-island-header.component';
import { BasicHeaderComponent } from '../../ui/headers/basic-header/basic-header.component';

@Component({
  selector: 'app-header-engine',
  standalone: true,
  imports: [CommonModule, FloatingIslandHeaderComponent, BasicHeaderComponent],
  template: `
    <ng-container *ngIf="headerData$ | async as header">
      <app-floating-island-header *ngIf="header.variant === 'floating-island'"></app-floating-island-header>
      <app-basic-header *ngIf="header.variant === 'basic'"></app-basic-header>
    </ng-container>
  `
})
export class HeaderEngineComponent {
  private projectService = inject(ProjectService);

  headerData$: Observable<any> = this.projectService.siteData$.pipe(
    map((data: any) => data?.jsonContent?.header)
  );
}