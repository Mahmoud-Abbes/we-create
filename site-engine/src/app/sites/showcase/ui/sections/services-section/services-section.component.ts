import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceCardComponent } from '../../components/service-card/service-card.component';

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [CommonModule, ServiceCardComponent],
  templateUrl: './services-section.component.html',
  styleUrl: './services-section.component.scss',
  encapsulation: ViewEncapsulation.None // Prevents Angular from isolating class-scoped grid variables
})
export class ServicesSectionComponent {
  @Input() content: any; // Passed down from HomePageEngine

  resolveBackground(): string {
    const appearance = this.content?.appearance;
    if (!appearance?.colors) return 'transparent';
    const { colors, gradientParams } = appearance;

    if (colors.color1 && colors.color2 && gradientParams) {
      return `linear-gradient(${gradientParams.angle}, ${colors.color1} ${gradientParams.color1Stop}, ${colors.color2} ${gradientParams.color2Stop})`;
    }

    return colors.color1 || 'transparent';
  }
}