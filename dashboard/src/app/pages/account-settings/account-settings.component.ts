import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';
import { KeycloakService } from '../../services/auth/keycloak.service';
import { AccountSettingsService } from '../../services/api/account.settings.service';
import { ConfirmDialogService } from '../../shared/ui/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
})
export class AccountSettingsComponent implements OnInit {
  private readonly authService = inject(KeycloakService);
  private readonly accountSettingsService = inject(AccountSettingsService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  userEmail = '';
  username = '';
  fullName = '';
  savingUsername = false;
  savingFullName = false;
  isGoogleUser = false;

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.accountSettingsService.getProfile().subscribe({
      next: (profile) => {
        this.userEmail = profile.email;
        this.username = profile.username;
        this.fullName = profile.fullName;
        this.isGoogleUser = profile.googleLinked;
        this.authService.setLocalProfile(profile.username, profile.fullName);
      },
      error: (err) => {
        console.error('Could not load profile settings', err);
        this.userEmail = this.authService.getEmail();
        this.username = this.authService.getUsername();
        this.fullName = this.authService.getUserFullName();
        this.isGoogleUser = this.authService.isGoogleUser();
      }
    });
  }

  onUpdateUsername(): void {
    if (!this.username.trim()) {
      toast.error('Username cannot be empty.');
      return;
    }

    this.savingUsername = true;
    this.accountSettingsService
      .updateUsername(this.username.trim(), this.fullName.trim())
      .pipe(finalize(() => (this.savingUsername = false)))
      .subscribe({
        next: () => {
          toast.success('Username updated.');
          this.authService.setLocalProfile(this.username.trim(), this.fullName.trim());
        },
        error: (err) => {
          toast.error(err.error?.message || 'Could not update username.');
        },
      });
  }

  onUpdateFullName(): void {
    this.savingFullName = true;
    this.accountSettingsService
      .updateFullName(this.fullName.trim(), this.username.trim())
      .pipe(finalize(() => (this.savingFullName = false)))
      .subscribe({
        next: () => {
          toast.success('Full name updated.');
          this.authService.setLocalProfile(this.username.trim(), this.fullName.trim());
        },
        error: (err) => {
          toast.error(err.error?.message || 'Could not update full name.');
        },
      });
  }

  onResetPassword(event: Event): void {
    event.preventDefault();
    this.authService.updatePassword().catch((err) => {
      console.error('Could not open password update', err);
      toast.error('Could not open password reset. Try again.');
    });
  }

  async onLogout(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Log out?',
      message: 'You will be signed out of your account on this device.',
      confirmLabel: 'Log out',
      cancelLabel: 'Stay signed in',
      variant: 'danger',
    });

    if (confirmed) {
      this.authService.logout();
    }
  }
}
