import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selection.component.html',
  styleUrl: './selection.component.scss'
})
export class SelectionComponent {
  @Input() selectedType: 'showcase' | 'ecommerce' | null = null;
  @Output() select = new EventEmitter<'showcase' | 'ecommerce'>();
  @Output() next = new EventEmitter<void>();

  onSelect(type: 'showcase' | 'ecommerce') {
    this.select.emit(type);
  }

  onNext() {
    this.next.emit();
  }
}
