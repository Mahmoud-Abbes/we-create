import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CreateShowcaseService } from '../../services/projects/create.showcase.service';

@Component({
  selector: 'app-creating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './creating.component.html',
  styleUrl: './creating.component.scss',
})
export class CreatingComponent implements OnInit {
  
  constructor(
    public showcaseService: CreateShowcaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    /**
     * Safety Check: If the user manually navigates here while not creating 
     * and no result exists, redirect them back to the start.
     */
    const isCreating = this.showcaseService.isShowcaseCreating$.value;
    const hasResult = this.showcaseService.showcaseProjectResult$.value;

    if (!isCreating && !hasResult) {
      this.router.navigate(['/welcome']);
      return;
    }

    // If we are stuck in 'creating' state but no process is running (e.g. after refresh), restart it.
    if (isCreating && !hasResult) {
      this.showcaseService.startShowcaseCreation();
    }
  }

  retry(): void {
    this.showcaseService.startShowcaseCreation();
  }

  clearAndGoHome(): void {
    // Optional: Clear session storage when the user leaves the success/fail screen
    sessionStorage.removeItem('isShowcaseCreating');
    sessionStorage.removeItem('showcaseProjectResult');
    this.router.navigate(['/welcome']);
  }

  viewProject(projectId: string): void {
  sessionStorage.removeItem('isShowcaseCreating');
  sessionStorage.removeItem('showcaseProjectResult');
  this.router.navigate(['/view', projectId]);
}
}