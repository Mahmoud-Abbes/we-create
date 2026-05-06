import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateShowcaseService } from '../../../../../services/projects/create.showcase.service';

@Component({
  selector: 'app-services',
  imports: [CommonModule, FormsModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  servicesData: any;

  errors = {
    isExpertiseDescriptionEmpty: false,
  };

  constructor(private showcaseService: CreateShowcaseService) { }

  ngOnInit() {
    this.servicesData = this.showcaseService.getServices();
  }

  saveToService() {
    this.showcaseService.setServices(this.servicesData);
  }

  onNext() {
    if (this.servicesData.show) {
      if (!this.servicesData.expertiseDescription?.trim()) {
        this.errors.isExpertiseDescriptionEmpty = true;
        return;
      }
    } else {
      this.servicesData.title = '';
      this.servicesData.description = '';
      this.servicesData.expertiseDescription = '';
      this.errors.isExpertiseDescriptionEmpty = false;
    }

    this.saveToService();

    console.log('--- Assembler Output (WeCreate Services) ---');
    console.log(this.showcaseService.getFullProject());
    console.log('-------------------------------------------');

    this.next.emit();
  }

  onBack() {
    this.saveToService();
    this.back.emit();
  }
}
