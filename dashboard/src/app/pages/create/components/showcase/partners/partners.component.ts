import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateShowcaseService } from '../../../../../services/projects/create.showcase.service';

@Component({
  selector: 'app-partners',
  imports: [CommonModule, FormsModule],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.scss',
})
export class PartnersComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  partnersData: any;

  errors = {
    isPartnerImagesEmpty: false,
  };

  constructor(private showcaseService: CreateShowcaseService) {}

  ngOnInit() {
    this.partnersData = this.showcaseService.getPartners();
  }

  saveToService() {
    this.showcaseService.setPartners(this.partnersData);
  }

  onLogoFilesChange(event: any) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    const uniqueFiles = files.filter(
      (file) => !this.partnersData.partnerCompanyUrlImages.includes((file as File).name),
    );

    const promises = uniqueFiles.map((file) =>
      this.readFile(file as File).then((byteData) => {
        this.showcaseService.addAsset({ imageName: (file as File).name, byteData });
        return (file as File).name;
      }),
    );

    Promise.all(promises).then((newNames) => {
      this.partnersData.partnerCompanyUrlImages = [
        ...this.partnersData.partnerCompanyUrlImages,
        ...newNames,
      ];
      if (newNames.length > 0) this.errors.isPartnerImagesEmpty = false;
      this.saveToService();
    });

    input.value = '';
  }

  removeLogo(index: number) {
    const fileName = this.partnersData.partnerCompanyUrlImages[index];
    if (!fileName) return;

    this.partnersData.partnerCompanyUrlImages.splice(index, 1);
    this.saveToService();
    this.showcaseService.removeAsset(fileName);

    if (this.partnersData.show && this.partnersData.partnerCompanyUrlImages.length === 0) {
      this.errors.isPartnerImagesEmpty = true;
    }
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
    // If the section is enabled, validate that there is at least one image
    if (this.partnersData.show) {
      if (this.partnersData.partnerCompanyUrlImages.length === 0) {
        this.errors.isPartnerImagesEmpty = true;
        return;
      }
    } else {
      /**
       * Logic: If show is false, we clean up the data and the assets.
       * We iterate backwards or create a copy to avoid index shifting
       * issues while calling removeLogo.
       */
      const imagesToPurge = [...this.partnersData.partnerCompanyUrlImages];

      imagesToPurge.forEach((_, index) => {
        // removeLogo handles both the array splice and the service asset check
        this.removeLogo(0);
      });

      // Explicitly ensure the array is empty in the local state
      this.partnersData.partnerCompanyUrlImages = [];
      this.errors.isPartnerImagesEmpty = false;
    }

    this.saveToService();

    console.log('--- Assembler Output (WeCreate Partners) ---');
    console.log(this.showcaseService.getFullProject());
    console.log('-------------------------------------------');

    this.next.emit();
  }

  onBack() {
    this.saveToService();
    this.back.emit();
  }
}
