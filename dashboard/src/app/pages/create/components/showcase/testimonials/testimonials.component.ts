import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateShowcaseService } from '../../../../../services/projects/create.showcase.service';

@Component({
  selector: 'app-testimonials',
  imports: [CommonModule, FormsModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
})
export class TestimonialsComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  testimonialsData: any;

  errors = {
    isTestimonialTextEmpty: false,
    isTestimonialsListEmpty: false,
  };

  constructor(private showcaseService: CreateShowcaseService) {}

  ngOnInit() {
    this.testimonialsData = this.showcaseService.getTestimonials();
    if (!this.testimonialsData.inputName) this.testimonialsData.inputName = '';
    if (!this.testimonialsData.inputPosition) this.testimonialsData.inputPosition = '';
    if (!this.testimonialsData.inputTestimonial) this.testimonialsData.inputTestimonial = '';
  }

  saveToService() {
    this.showcaseService.setTestimonials(this.testimonialsData);
  }

  addTestimonial() {
    const testimonial = this.testimonialsData.inputTestimonial?.trim() ?? '';

    if (!testimonial) {
      this.errors.isTestimonialTextEmpty = true;
      return;
    }

    this.errors.isTestimonialTextEmpty = false;
    this.errors.isTestimonialsListEmpty = false;

    this.testimonialsData.items.push({
      name: this.testimonialsData.inputName?.trim() ?? '',
      position: this.testimonialsData.inputPosition?.trim() ?? '',
      testimonial,
      imageUrl: '',
    });

    this.testimonialsData.inputName = '';
    this.testimonialsData.inputPosition = '';
    this.testimonialsData.inputTestimonial = '';
    this.saveToService();
  }

  removeTestimonial(index: number) {
    this.testimonialsData.items.splice(index, 1);
    this.saveToService();
  }

  onNext() {
    if (this.testimonialsData.show) {
      if (this.testimonialsData.items.length === 0) {
        this.errors.isTestimonialsListEmpty = true;
        return;
      }
    } else {
      this.testimonialsData.items = [];
      this.testimonialsData.inputName = '';
      this.testimonialsData.inputPosition = '';
      this.testimonialsData.inputTestimonial = '';
      this.errors.isTestimonialTextEmpty = false;
      this.errors.isTestimonialsListEmpty = false;
    }

    this.saveToService();

    console.log('--- Assembler Output (WeCreate Testimonials) ---');
    console.log(this.showcaseService.getFullProject());
    console.log('-------------------------------------------');

    this.next.emit();
  }

  onBack() {
    this.saveToService();
    this.back.emit();
  }
}
