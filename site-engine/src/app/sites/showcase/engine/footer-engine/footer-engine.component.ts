import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterBasicComponent } from "../../ui/footers/footer-basic/footer-basic.component";
import { map, Observable } from 'rxjs';
import { ProjectService } from '../../../../api/project.service';

@Component({
  selector: 'app-footer-engine',
  standalone: true,
  imports: [CommonModule, FooterBasicComponent],
  templateUrl: './footer-engine.component.html',
  styleUrl: './footer-engine.component.scss'
})
export class FooterEngineComponent {
  private projectService = inject(ProjectService);
  
  siteData$: Observable<any> = this.projectService.siteData$.pipe(
    map(project => project?.jsonContent)
  );
}