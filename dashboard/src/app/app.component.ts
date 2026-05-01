import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeycloakService } from './auth/keycloak.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class App {
  private keycloakService = inject(KeycloakService);

  protected readonly isAuthReady$ = this.keycloakService.isReady$;
  protected readonly title = signal('dashboard');
}
