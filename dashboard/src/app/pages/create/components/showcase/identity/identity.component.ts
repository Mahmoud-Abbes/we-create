import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateShowcaseService } from '../../../../../services/projects/create.showcase.service';

@Component({
  selector: 'app-identity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './identity.component.html',
  styleUrl: './identity.component.scss',
})
export class IdentityComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  // Updated naming to reflect the specific variable in the service
  brandIdentityData: any;

  errors = {
    companyName: false,
    faviconUrl: false,
  };

  constructor(private showcaseService: CreateShowcaseService) {}

  ngOnInit() {
    // Initialize specifically with brandIdentity data from service
    this.brandIdentityData = this.showcaseService.getBrandIdentity();
  }

  onFieldBlur(field: string) {
    if (field === 'companyName') {
      this.errors.companyName = !this.brandIdentityData.companyName;
    }
  }

  onFieldInput(field: string) {
    if (field === 'companyName') {
      if (this.brandIdentityData.companyName) this.errors.companyName = false;
    }
  }

  onLogoChange(event: any) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.readFile(file).then((byteData) => {
        const asset = { imageName: file.name, byteData: byteData };

        // 1. Store byte data in assets
        this.showcaseService.addAsset(asset);
        // 2. Store only the name in brandIdentity
        this.brandIdentityData.faviconUrl = file.name;
        this.errors.faviconUrl = false;
        this.saveToService();
      });
    }
    input.value = '';
  }

  onCompanyImagesChange(event: any) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    const uniqueFiles = files.filter(
      (file) => !this.brandIdentityData.companyImages.includes(file.name),
    );

    const promises = uniqueFiles.map((file) =>
      this.readFile(file).then((byteData) => {
        const asset = { imageName: file.name, byteData: byteData };
        this.showcaseService.addAsset(asset);
        return file.name;
      }),
    );

    Promise.all(promises).then((newImageNames) => {
      this.brandIdentityData.companyImages = [
        ...this.brandIdentityData.companyImages,
        ...newImageNames,
      ];
      this.saveToService();
    });

    input.value = '';
  }

  removeLogo() {
    const fileName = this.brandIdentityData.faviconUrl;
    if (!fileName) return;

    this.brandIdentityData.faviconUrl = '';
    this.errors.faviconUrl = true;
    this.saveToService();
    this.showcaseService.removeAsset(fileName);
  }

  removeCompanyImage(index: number) {
    const fileName = this.brandIdentityData.companyImages[index];
    if (!fileName) return;

    this.brandIdentityData.companyImages.splice(index, 1);
    this.saveToService();
    this.showcaseService.removeAsset(fileName);
  }

  private saveToService() {
    // Specifically calling setBrandIdentity
    this.showcaseService.setBrandIdentity(this.brandIdentityData);
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  onNext() {
    this.errors.companyName = !this.brandIdentityData.companyName;
    this.errors.faviconUrl = !this.brandIdentityData.faviconUrl;

    if (this.errors.companyName || this.errors.faviconUrl) {
      return;
    }

    this.saveToService();

    console.log('--- Assembler Output (WeCreate Identity) ---');
    console.log(this.showcaseService.getFullProject());
    console.log('-------------------------------------------');

    this.next.emit();
  }

  onBack() {
    this.saveToService();
    this.back.emit();
  }
}
