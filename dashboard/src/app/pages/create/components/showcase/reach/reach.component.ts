import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateShowcaseService } from '../../../../../services/projects/create.showcase.service';

@Component({
  selector: 'app-reach',
  imports: [CommonModule, FormsModule],
  templateUrl: './reach.component.html',
  styleUrl: './reach.component.scss',
})
export class ReachComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  brandPresenceData: any;

  errors = {
    isReceivingEmailFilled: true,
    isReceivingEmailValid: true,
    isDisplayEmailValid: true,
    isDisplayEmailDuplicate: false,
    isPhoneValid: true,
    isPhoneDuplicate: false,
    isLocationValid: true,
    isLocationMapsValid: true,
    isLocationAddressDuplicate: false,
    isLocationMapsDuplicate: false,
    isSocialValid: true,
    isSocialDuplicate: false,
  };

  constructor(private showcaseService: CreateShowcaseService) {}

  ngOnInit() {
    this.brandPresenceData = this.showcaseService.getBrandPresence();
  }

  private saveToService() {
    this.showcaseService.setBrandPresence(this.brandPresenceData);
  }

  // ── Validators ─────────────────────────────────────────

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private isValidPhone(value: string): boolean {
    return /^\+?[\d\s\-().]{6,20}$/.test(value);
  }

  private isValidUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // ── Receiving Email ────────────────────────────────────

  private validateReceivingEmail() {
    const value = this.brandPresenceData.brandContacts.receivingEmail.trim();
    this.errors.isReceivingEmailFilled = !!value;
    this.errors.isReceivingEmailValid = !value || this.isValidEmail(value);
  }

  onReceivingEmailBlur() {
    this.validateReceivingEmail();
    this.saveToService();
  }

  onReceivingEmailInput() {
    const value = this.brandPresenceData.brandContacts.receivingEmail.trim();
    if (value) this.errors.isReceivingEmailFilled = true;
    if (this.isValidEmail(value)) this.errors.isReceivingEmailValid = true;
  }

  // ── Public Emails ──────────────────────────────────────

  addEmail() {
    const value = this.brandPresenceData.emailInput?.trim() ?? '';
    this.errors.isDisplayEmailValid = !!value && this.isValidEmail(value);
    this.errors.isDisplayEmailDuplicate =
      this.brandPresenceData.brandContacts.publicEmails.includes(value);

    if (!this.errors.isDisplayEmailValid || this.errors.isDisplayEmailDuplicate) return;

    this.brandPresenceData.brandContacts.publicEmails.push(value);
    this.brandPresenceData.emailInput = '';
    this.saveToService();
  }

  removeEmail(index: number) {
    this.brandPresenceData.brandContacts.publicEmails.splice(index, 1);
    this.saveToService();
  }

  // ── Phone Numbers ──────────────────────────────────────

  addPhone() {
    const value = this.brandPresenceData.phoneInput?.trim() ?? '';
    this.errors.isPhoneValid = !!value && this.isValidPhone(value);
    this.errors.isPhoneDuplicate =
      this.brandPresenceData.brandContacts.phoneNumbers.includes(value);

    if (!this.errors.isPhoneValid || this.errors.isPhoneDuplicate) return;

    this.brandPresenceData.brandContacts.phoneNumbers.push(value);
    this.brandPresenceData.phoneInput = '';
    this.saveToService();
  }

  removePhone(index: number) {
    this.brandPresenceData.brandContacts.phoneNumbers.splice(index, 1);
    this.saveToService();
  }

  // ── Locations ──────────────────────────────────────────

  addLocation() {
    const address = this.brandPresenceData.locationAddressInput?.trim() ?? '';
    const mapsUrl = this.brandPresenceData.locationMapsInput?.trim() ?? '';

    this.errors.isLocationValid = !!address || !!mapsUrl;
    this.errors.isLocationMapsValid = !mapsUrl || this.isValidUrl(mapsUrl);
    this.errors.isLocationAddressDuplicate =
      !!address &&
      this.brandPresenceData.brandContacts.locations.some((l: any) => l.address === address);
    this.errors.isLocationMapsDuplicate =
      !!mapsUrl &&
      this.brandPresenceData.brandContacts.locations.some((l: any) => l.mapsUrl === mapsUrl);

    if (
      !this.errors.isLocationValid ||
      !this.errors.isLocationMapsValid ||
      this.errors.isLocationAddressDuplicate ||
      this.errors.isLocationMapsDuplicate
    )
      return;

    this.brandPresenceData.brandContacts.locations.push({ address, mapsUrl });
    this.brandPresenceData.locationAddressInput = '';
    this.brandPresenceData.locationMapsInput = '';
    this.saveToService();
  }

  removeLocation(index: number) {
    this.brandPresenceData.brandContacts.locations.splice(index, 1);
    this.saveToService();
  }

  // ── Socials ────────────────────────────────────────────

  addSocial() {
    const value = this.brandPresenceData.socialInput?.trim() ?? '';
    this.errors.isSocialValid = !!value && this.isValidUrl(value);
    this.errors.isSocialDuplicate = this.brandPresenceData.socialsUrls.includes(value);

    if (!this.errors.isSocialValid || this.errors.isSocialDuplicate) return;

    this.brandPresenceData.socialsUrls.push(value);
    this.brandPresenceData.socialInput = '';
    this.saveToService();
  }

  removeSocial(index: number) {
    this.brandPresenceData.socialsUrls.splice(index, 1);
    this.saveToService();
  }

  // ── Navigation ─────────────────────────────────────────

  onNext() {
    this.validateReceivingEmail();

    if (!this.errors.isReceivingEmailFilled || !this.errors.isReceivingEmailValid) return;

    this.saveToService();

    console.log('--- Assembler Output (WeCreate Reach) ---');
    console.log(this.showcaseService.getFullProject());
    console.log('-------------------------------------------');

    this.next.emit();
  }

  onBack() {
    this.saveToService();
    this.back.emit();
  }
}
