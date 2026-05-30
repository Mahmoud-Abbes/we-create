import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ConfirmVariant = 'default' | 'primary' | 'danger';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

export interface ConfirmDialogState {
  visible: boolean;
  options: ConfirmOptions | null;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private resolveFn: ((value: boolean) => void) | null = null;

  readonly state$ = new BehaviorSubject<ConfirmDialogState>({
    visible: false,
    options: null,
  });

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolveFn = resolve;
      this.state$.next({ visible: true, options });
    });
  }

  accept(): void {
    this.finish(true);
  }

  dismiss(): void {
    this.finish(false);
  }

  private finish(result: boolean): void {
    this.state$.next({ visible: false, options: null });
    this.resolveFn?.(result);
    this.resolveFn = null;
  }
}
