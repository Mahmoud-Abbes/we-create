import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.scss',
  encapsulation: ViewEncapsulation.None // Keeps custom SCSS targeting the dynamic inline SVG path intact
})
export class ServiceCardComponent {
  // Item specific contents
  @Input() svgIconData: string = '';
  @Input() title: string = '';
  @Input() description: string = '';

  // Universal section card styles passed down from parent
  @Input() appearance: any; 
}