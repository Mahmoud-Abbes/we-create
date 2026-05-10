import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ShowcaseResponse } from '../../../core/interfaces/api/showcase-response.interface';

@Injectable({
  providedIn: 'root'
})
export class CreateShowcaseConnectorService {
  private readonly endpoint = `${environment.apiUrl}/api/project/finalize`;

  constructor(private http: HttpClient) {}

  async sendProjectToApi(projectData: any): Promise<ShowcaseResponse> {
    return await firstValueFrom(
      this.http.post<ShowcaseResponse>(this.endpoint, {
        userContext: projectData.userContext,
        userAssets: projectData.userAssets
      })
    );
  }
}