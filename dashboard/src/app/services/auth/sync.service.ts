import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { catchError, retry, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  private isSyncedSignal = signal<boolean>(false);

  get isSynced() {
    return this.isSyncedSignal();
  }

  syncUser() {
    return this.http.post(`${environment.apiUrl}/auth/sync`, {}, { responseType: 'text' }).pipe(
      // Rule: Retry 3 times before giving up
      retry(3), 
      tap((message) => {
        this.isSyncedSignal.set(true);
        this.toastr.success(message, 'Sync success');
      }),
      catchError((err) => {
        // We don't show the toastr here anymore because we'll show the UI Error Card
        throw err;
      }),
    );
  }
}