import { Component, HostListener, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  readonly confirmService = inject(ConfirmDialogService);
  readonly state$ = this.confirmService.state$;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    const state = this.confirmService.state$.value;
    if (state.visible) {
      this.confirmService.dismiss();
    }
  }

  onBackdropClick(): void {
    this.confirmService.dismiss();
  }

  onDialogClick(event: MouseEvent): void {
    event.stopPropagation();
  }
}
