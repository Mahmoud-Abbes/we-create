import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UpdateAccountSettingsRequest {
  username: string;
  fullName: string;
}

export interface AccountSettingsProfile extends UpdateAccountSettingsRequest {
  email: string;
  googleLinked: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AccountSettingsService {
  private readonly baseUrl = `${environment.apiUrl}/account/settings`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<AccountSettingsProfile> {
    return this.http.get<AccountSettingsProfile>(this.baseUrl);
  }

  updateProfile(payload: UpdateAccountSettingsRequest): Observable<void> {
    return this.http.put<void>(this.baseUrl, payload);
  }

  updateUsername(username: string, fullName: string): Observable<void> {
    return this.updateProfile({ username, fullName });
  }

  updateFullName(fullName: string, username: string): Observable<void> {
    return this.updateProfile({ username, fullName });
  }
}
