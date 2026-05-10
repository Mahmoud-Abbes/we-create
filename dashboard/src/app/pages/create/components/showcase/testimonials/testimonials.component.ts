import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateShowcaseService } from '../../../../../services/projects/create.showcase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-testimonials',
  standalone: true, // Ensuring standalone is consistent with your setup
  imports: [CommonModule, FormsModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
})
export class TestimonialsComponent implements OnInit {
  @Output() back = new EventEmitter<void>();

  testimonialsData: any;

  errors = {
    isTestimonialTextEmpty: false,
    isTestimonialsListEmpty: false,
  };

  constructor(
    private showcaseService: CreateShowcaseService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.testimonialsData = this.showcaseService.getTestimonials();
    // Initialize input fields if they don't exist in the service state
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

    // Reset local inputs
    this.testimonialsData.inputName = '';
    this.testimonialsData.inputPosition = '';
    this.testimonialsData.inputTestimonial = '';
    this.saveToService();
  }

  removeTestimonial(index: number) {
    this.testimonialsData.items.splice(index, 1);
    this.saveToService();
  }

  /**
   * Final validation and trigger for the creation process.
   */
  onFinish() {
    // Validation logic for the Testimonials section
    if (this.testimonialsData.show) {
      if (this.testimonialsData.items.length === 0) {
        this.errors.isTestimonialsListEmpty = true;
        return;
      }
    } else {
      // Clear data if section is disabled
      this.testimonialsData.items = [];
      this.testimonialsData.inputName = '';
      this.testimonialsData.inputPosition = '';
      this.testimonialsData.inputTestimonial = '';
      this.errors.isTestimonialTextEmpty = false;
      this.errors.isTestimonialsListEmpty = false;
    }

    // Persist final step state to the service
    this.saveToService();

    // Trigger the background API call and navigate to the observer page
    this.finishProject();
  }

  onBack() {
    this.saveToService();
    this.back.emit();
  }

  /**
   * Triggers the service's creation flow and redirects immediately.
   */
  finishProject() {
    // 1. Kick off the background process (no 'await' here)
    this.showcaseService.startShowcaseCreation();

    // 2. Immediately navigate to the loading/observer page
    this.router.navigate(['/creating']);
  }
}
