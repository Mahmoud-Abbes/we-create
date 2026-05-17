import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class ShowcaseThemeService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  applyShowcaseStyles(theme: any) {
    // 1. SAFETY FIRST: Stop the server from crashing
    if (!isPlatformBrowser(this.platformId) || !theme) return;

    const root = document.documentElement.style;

    // 2. Set the CSS Variables
    root.setProperty('--primary', theme.colors.primary);
    root.setProperty('--secondary', theme.colors.secondary || theme.colors.primary);
    root.setProperty('--surface', theme.colors.surface || '#ffffff');
    root.setProperty('--background', theme.colors.background || '#f0f2f5');
    root.setProperty('--accent', theme.colors.accent || theme.colors.secondary || theme.colors.primary);
    root.setProperty('--text', theme.colors.text);

    root.setProperty('--borderRadius', theme.layout?.borderRadius || '16px');
    root.setProperty('--containerWidth', theme.layout?.containerWidth);

    root.setProperty('--headingFont', theme.typography.headingFont);
    root.setProperty('--bodyFont', theme.typography.bodyFont);

    // 3. Inject the Font Download Link
    if (theme.typography.googleFontUrl) {
      this.injectGoogleFonts(theme.typography.googleFontUrl);
    }
  }

  private injectGoogleFonts(url: string) {
    // Another safety check for the browser
    if (!isPlatformBrowser(this.platformId)) return;

    let link = document.getElementById('showcase-fonts') as HTMLLinkElement;

    if (!link) {
      link = document.createElement('link');
      link.id = 'showcase-fonts';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Update the URL if it changed
    if (link.href !== url) {
      link.href = url;
    }
  }
}