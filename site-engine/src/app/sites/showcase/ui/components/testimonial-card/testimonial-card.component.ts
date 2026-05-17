import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-testimonial-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonial-card.component.html',
  styleUrl: './testimonial-card.component.scss',
  encapsulation: ViewEncapsulation.None // Safeguards inner text styles and SVG quote paths
})
export class TestimonialCardComponent {
  // Item specific content fields
  @Input() authorName: string = '';
  @Input() position: string = '';
  @Input() testimonial: string = '';

  // Layout configuration styles streamed down from parent section
  @Input() appearance: any; 
}