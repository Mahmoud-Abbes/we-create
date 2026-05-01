import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { catchError, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // Minimalist signal for global state tracking
  private isSyncedSignal = signal<boolean>(false);

  get isSynced() {
    return this.isSyncedSignal();
  }

  syncUser() {
    return this.http.post('http://localhost:8080/api/auth/sync', {}, { responseType: 'text' }).pipe(
      tap((message) => {
        this.isSyncedSignal.set(true); // The switch turns on
        this.toastr.success(message, 'Sync success');
      }),
      catchError((err) => {
        this.toastr.error('Sync failed. Please refresh.', 'Security Error');
        throw err;
      }),
    );
  }
}
