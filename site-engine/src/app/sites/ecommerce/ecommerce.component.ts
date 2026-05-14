import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ecommerce',
  imports: [CommonModule],
  templateUrl: './ecommerce.component.html',
  styleUrl: './ecommerce.component.scss',
})
export class EcommerceComponent {
  @Input() content: any;
}
