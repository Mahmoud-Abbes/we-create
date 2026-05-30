import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, retry, tap, of, shareReplay, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private http = inject(HttpClient);

  private isSyncedSignal = signal<boolean>(false);
  private syncObservable$: Observable<string> | null = null;

  get isSynced() {
    return this.isSyncedSignal();
  }

  syncUser(): Observable<string> {
    if (this.isSyncedSignal()) {
      return of('Already synced');
    }
    if (this.syncObservable$) {
      return this.syncObservable$;
    }

    this.syncObservable$ = this.http.post(`${environment.apiUrl}/auth/sync`, {}, { responseType: 'text' }).pipe(
      // Rule: Retry 3 times before giving up
      retry(3), 
      tap((message) => {
        this.isSyncedSignal.set(true);
        console.log('User synced successfully:', message);
      }),
      catchError((err) => {
        this.syncObservable$ = null; // Reset on error to allow retries
        throw err;
      }),
      shareReplay(1)
    );

    return this.syncObservable$;
  }
}