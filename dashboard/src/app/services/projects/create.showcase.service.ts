import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CreateShowcaseConnectorService } from '../api/project/create.showcase.connector.service';
import { ShowcaseResponse } from '../../core/interfaces/api/showcase-response.interface';

type UserAsset = { imageName: string; byteData: string };

@Injectable({
  providedIn: 'root',
})
export class CreateShowcaseService {

  public isShowcaseCreating$ = new BehaviorSubject<boolean>(
    sessionStorage.getItem('isShowcaseCreating') === 'true'
  );

  public showcaseProjectResult$ = new BehaviorSubject<ShowcaseResponse | null>(
    JSON.parse(sessionStorage.getItem('showcaseProjectResult') || 'null')
  );

  constructor(private connector: CreateShowcaseConnectorService) {
    if (this.showcaseProjectResult$.value && this.isShowcaseCreating$.value) {
      this.updateCreatingStatus(false);
    }
  }

  private _isCallInProgress = false;

  async startShowcaseCreation() {
    if (this._isCallInProgress) return;

    this._isCallInProgress = true;
    this.updateCreatingStatus(true);

    this.showcaseProjectResult$.next(null);
    sessionStorage.removeItem('showcaseProjectResult');

    try {
      await this.convertAllAssetsToWebp();

      console.log('userContext BEFORE send:', JSON.stringify(this.completeProject.userContext, null, 2));

      const response = await this.connector.sendProjectToApi(this.completeProject);

      console.log('userContext AFTER send:', JSON.stringify(this.completeProject.userContext, null, 2));

      this.showcaseProjectResult$.next(response);
      sessionStorage.setItem('showcaseProjectResult', JSON.stringify(response));
    } catch (error) {
      console.error('Showcase creation failed:', error);
      const errorResult: ShowcaseResponse = { creationStatus: 'fail', projectId: null };
      this.showcaseProjectResult$.next(errorResult);
      sessionStorage.setItem('showcaseProjectResult', JSON.stringify(errorResult));
    } finally {
      this._isCallInProgress = false;
      this.updateCreatingStatus(false);
    }
  }

  private updateCreatingStatus(status: boolean) {
    this.isShowcaseCreating$.next(status);
    sessionStorage.setItem('isShowcaseCreating', status.toString());
  }

  // ── State Sections ──────────────────────────────────────

  private brandIdentity = new BehaviorSubject<any>({
    companyName: '',
    title: '',
    slogan: '',
    faviconUrl: '',
    companyImages: [],
  });

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
  private about = new BehaviorSubject<any>({ show: false, title: '', brandStory: '' });
  private milestones = new BehaviorSubject<any>({ show: true, achievementsDescription: '' });
  private services = new BehaviorSubject<any>({
    show: true,
    title: '',
    description: '',
    expertiseDescription: '',
  });
  private testimonials = new BehaviorSubject<any>({ show: true, items: [] });
  private userAssets = new BehaviorSubject<UserAsset[]>([]);

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

  // ── Setters & Getters ───────────────────────────────────

  setBrandIdentity(data: any) { this.brandIdentity.next({ ...this.brandIdentity.value, ...data }); }
  getBrandIdentity() { return this.brandIdentity.value; }

  setBrandPresence(data: any) { this.brandPresence.next({ ...this.brandPresence.value, ...data }); }
  getBrandPresence() { return this.brandPresence.value; }

  setTheme(data: any) { this.theme.next({ ...this.theme.value, ...data }); }
  getTheme() { return this.theme.value; }

  setAbout(data: any) { this.about.next({ ...this.about.value, ...data }); }
  getAbout() { return this.about.value; }

  setPartners(data: any) { this.partners.next({ ...this.partners.value, ...data }); }
  getPartners() { return this.partners.value; }

  setMilestones(data: any) { this.milestones.next({ ...this.milestones.value, ...data }); }
  getMilestones() { return this.milestones.value; }

  setServices(data: any) { this.services.next({ ...this.services.value, ...data }); }
  getServices() { return this.services.value; }

  setTestimonials(data: any) { this.testimonials.next({ ...this.testimonials.value, ...data }); }
  getTestimonials() { return this.testimonials.value; }

  // ── Asset Management ────────────────────────────────────

  addAsset(asset: UserAsset) {
    const current = this.userAssets.value;
    const exists = current.some((existing) => existing.imageName === asset.imageName);
    if (!exists) {
      this.userAssets.next([...current, asset]);
    }
  }

  removeAsset(imageName: string) {
    if (!imageName || this.isAssetInUse(imageName)) return;
    const current = this.userAssets.value;
    this.userAssets.next(current.filter((asset) => asset.imageName !== imageName));
  }

  private isAssetInUse(imageName: string): boolean {
    if (!imageName) return false;
    const contextString = JSON.stringify(this.completeProject.userContext);
    return contextString.includes(`"${imageName}"`);
  }

  getUserAssets() { return this.userAssets.value; }
  getFullProject() { return this.completeProject; }

  // ── WebP Conversion ─────────────────────────────────────

  private async convertAllAssetsToWebp(): Promise<void> {
    const current = this.userAssets.value;

    const converted = await Promise.all(
      current.map(async (asset) => {
        if (asset.imageName.endsWith('.webp')) return asset;
        const webpByteData = await this.convertBase64ToWebp(asset.byteData);
        const webpName = asset.imageName.replace(/\.[^.]+$/, '') + '.webp';
        return { imageName: webpName, byteData: webpByteData };
      })
    );

    const renameMap = new Map<string, string>();
    current.forEach((asset, i) => {
      if (asset.imageName !== converted[i].imageName) {
        renameMap.set(asset.imageName, converted[i].imageName);
      }
    });

    this.userAssets.next(converted);

    if (renameMap.size > 0) {
      this.renameReferencesInContext(renameMap);
    }
  }

  private renameReferencesInContext(renameMap: Map<string, string>): void {
    const renameInArray = (arr: string[]): string[] =>
      arr.map((name) => renameMap.get(name) ?? name);

    const id = { ...this.brandIdentity.value };
    if (renameMap.has(id.faviconUrl)) id.faviconUrl = renameMap.get(id.faviconUrl)!;
    id.companyImages = renameInArray(id.companyImages);
    this.brandIdentity.next(id);

    const pt = { ...this.partners.value };
    pt.partnerCompanyUrlImages = renameInArray(pt.partnerCompanyUrlImages);
    this.partners.next(pt);

    const ts = { ...this.testimonials.value };
    ts.items = ts.items.map((item: any) => ({
      ...item,
      imageUrl: renameMap.get(item.imageUrl) ?? item.imageUrl,
    }));
    this.testimonials.next(ts);
  }

  private convertBase64ToWebp(base64: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/webp', 0.9));
      };
      img.onerror = reject;
      img.src = base64;
    });
  }
}