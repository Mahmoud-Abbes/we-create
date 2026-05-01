import { Component, inject } from '@angular/core';
import { KeycloakService } from '../../auth/keycloak.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  standalone: true,
})
export class LandingComponent {
  private authService = inject(KeycloakService);
  private toastr = inject(ToastrService);

  // Auth.1. OCID : Asking for user identification.

  /**
   * RULE #2 (Auth Security):
   * Initiates redirect to the Identity Provider (Keycloak).
   * Correlation: Offloading authentication to a dedicated provider ensures the UI
   * never handles raw credentials, reducing the attack surface for RULE #1 (XSS).
   */
  async signIn(): Promise<void> {
    try {
      await this.authService.login('/welcome');
    } catch (error) {
      console.error('Login flow failed:', error);
      this.toastr.error('Authentication failed. Please try again.', 'Sign-in failed');
    }
  }
}
