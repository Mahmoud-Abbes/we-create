import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Using a Type Alias for cleaner code
type UserAsset = { imageName: string; byteData: string };

@Injectable({
  providedIn: 'root',
})
export class CreateShowcaseService {
  // 1. Disassembled State Sections

  // Step 1: Core Branding
  private brandIdentity = new BehaviorSubject<any>({
    companyName: '',
    title: '',
    slogan: '',
    faviconUrl: '',
    companyImages: [],
  });

  // Step 2: Contact & Socials
  private brandPresence = new BehaviorSubject<any>({
    brandContacts: {
      receivingEmail: '',
      publicEmails: [],
      phoneNumbers: [],
      locations: [],
    },
    socialsUrls: [],
  });

  private theme = new BehaviorSubject<any>({
    primaryColor: '',
    secondaryColor: '',
    accentColor: '',
  });

  private partners = new BehaviorSubject<any>({ show: true, partnerCompanyUrlImages: [] });
  private about = new BehaviorSubject<any>({ show: true, title: '', brandStory: '' });
  private milestones = new BehaviorSubject<any>({ show: true, achievementsDescription: '' });
  private services = new BehaviorSubject<any>({
    show: true,
    title: '',
    description: '',
    expertiseDescription: '',
  });
  private testimonials = new BehaviorSubject<any>({ show: true, items: [] });

  private userAssets = new BehaviorSubject<UserAsset[]>([]);

  constructor() { }

  /**
   * Getter: The "Assembler"
   * Combines all individual sections into the final JSON structure for the backend.
   */
  get completeProject() {
    return {
      userContext: {
        identity: {
          ...this.brandIdentity.value,
          ...this.brandPresence.value,
        },
        theme: this.theme.value,
        sections: {
          partners: this.partners.value,
          about: this.about.value,
          milestones: this.milestones.value,
          services: this.services.value,
          testimonials: this.testimonials.value,
        },
      },
      userAssets: this.userAssets.value,
    };
  }

  // --- Identity Getters & Setters ---
  setBrandIdentity(data: any) {
    this.brandIdentity.next({ ...this.brandIdentity.value, ...data });
  }

  getBrandIdentity() {
    return this.brandIdentity.value;
  }

  setBrandPresence(data: any) {
    this.brandPresence.next({ ...this.brandPresence.value, ...data });
  }

  getBrandPresence() {
    return this.brandPresence.value;
  }

  // --- Other Section Setters ---
  setTheme(data: any) {
    this.theme.next({ ...this.theme.value, ...data });
  }

  getTheme() {
    return this.theme.value;
  }

  setAbout(data: any) {
    this.about.next({ ...this.about.value, ...data });
  }

  getAbout() {
    return this.about.value;
  }

  setPartners(data: any) {
    this.partners.next({ ...this.partners.value, ...data });
  }

  getPartners() {
    return this.partners.value;
  }

  setMilestones(data: any) {
    this.milestones.next({ ...this.milestones.value, ...data });
  }

  getMilestones() {
    return this.milestones.value;
  }

  setServices(data: any) {
    this.services.next({ ...this.services.value, ...data });
  }

  getServices() {
    return this.services.value;
  }

  setTestimonials(data: any) {
    this.testimonials.next({ ...this.testimonials.value, ...data });
  }

  getTestimonials() {
    return this.testimonials.value;
  }
  // --- Asset Management ---
  addAsset(asset: UserAsset) {
    const current = this.userAssets.value;

    // Check if an asset with the same name is already present
    const exists = current.some((existing) => existing.imageName === asset.imageName);

    if (!exists) {
      this.userAssets.next([...current, asset]);
      console.log(`Asset "${asset.imageName}" added successfully.`);
    } else {
      console.log(`Asset "${asset.imageName}" already exists in store.`);
    }
  }

  removeAsset(imageName: string) {
    if (!imageName) return;

    if (this.isAssetInUse(imageName)) {
      console.log(`Asset "${imageName}" is still in use. Skipping physical removal.`);
      return;
    }

    const current = this.userAssets.value;
    const filtered = current.filter((asset) => asset.imageName !== imageName);
    this.userAssets.next(filtered);
    console.log(`Asset "${imageName}" removed from store.`);
  }

  private isAssetInUse(imageName: string): boolean {
    if (!imageName) return false;

    // Get the current assembled userContext
    const context = this.completeProject.userContext;

    /**
     * Option A: Stringify Search (Quickest for simple name checks)
     * We convert the object to a string and check for the "exact" image name value.
     * We wrap it in quotes to ensure we aren't matching substrings of other data.
     */
    const contextString = JSON.stringify(context);

    // We search for the filename as a JSON value (e.g., ": "my-image.png"")
    return contextString.includes(`"${imageName}"`);
  }

  getUserAssets() {
    return this.userAssets.value;
  }

  /*
    Temporary Method for testing
  */
  getFullProject() {
    return this.completeProject;
  }
}
