import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer-basic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer-basic.component.html',
  styleUrl: './footer-basic.component.scss',
  encapsulation: ViewEncapsulation.None // Prevents Angular from stripping custom row alignment or icon padding styles
})
export class FooterBasicComponent {
  @Input() data: any; // Receives the full root database config object containing identity and footer presets

  hasMapsUrl(loc: { mapsUrl?: string } | null | undefined): boolean {
    const u = loc?.mapsUrl;
    return typeof u === 'string' && u.trim().length > 0;
  }

  validSocials(socials: unknown): Array<{ platform?: string; url: string; platformSvg: string }> {
    if (!Array.isArray(socials)) return [];
    return socials.filter(
      (s: any) =>
        typeof s?.url === 'string' &&
        s.url.trim().length > 0 &&
        typeof s?.platformSvg === 'string' &&
        s.platformSvg.trim().length > 0,
    );
  }

  /**
   * Social link circle backgrounds. `footer.iconsColor` empty → theme primary; when set → trimmed CSS color.
   */
  contactIconsBackground(): string {
    const c = this.data?.footer?.iconsColor;
    if (typeof c !== 'string' || c.trim().length === 0) {
      return 'var(--primary)';
    }
    return c.trim();
  }
}