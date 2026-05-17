import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { ProjectService } from '../../../../api/project.service';
// import { ProjectService } from '../../core/services/project.service';
import { SplitContactComponent } from '../../ui/contacts/split-contact/split-contact.component';

@Component({
  selector: 'app-contact-page-engine',
  standalone: true,
  imports: [CommonModule, SplitContactComponent],
  templateUrl: './contact-page-engine.component.html',
  styleUrl: './contact-page-engine.component.scss',
  encapsulation: ViewEncapsulation.None // Preserves structural viewport height classes safely
})
export class ContactPageEngineComponent implements OnInit {
  siteData$: Observable<any> | undefined;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    // Synchronously tracks the stream from RAM on boot
    this.siteData$ = this.projectService.siteData$.pipe(
      map(project => project?.jsonContent)
    );
  }
}