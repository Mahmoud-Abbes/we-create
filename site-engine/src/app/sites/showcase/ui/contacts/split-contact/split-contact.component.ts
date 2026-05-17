import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { ProjectService } from '../../../../../api/project.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MailerService } from '../../../services/mailer.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-split-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './split-contact.component.html',
  styleUrl: './split-contact.component.scss',
})
export class SplitContactComponent {
  siteData$: Observable<any>;

  formData = {
    name: '',
    email: '',
    message: '',
  };

  constructor(
    private projectService: ProjectService,
    private mailerService: MailerService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.siteData$ = this.projectService.siteData$.pipe(
      map(project => project?.jsonContent)
    );
  }

  contactPage(data: any) {
    return data?.pages?.contactPage;
  }

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

  async onSubmit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const data = await firstValueFrom(this.siteData$);
    const target = data?.identity?.brandContacts?.receivingEmail;

    if (!target) {
      alert('Error: No receiving email found in configuration.');
      return;
    }

    try {
      await this.mailerService.sendContactEmail(
        this.formData.name,
        this.formData.email,
        this.formData.message,
        target,
      );
      alert('Message sent successfully!');
      this.formData = { name: '', email: '', message: '' };
    } catch (err) {
      console.error('Mail Error:', err);
      alert('Failed to send message. Check console for details.');
    }
  }
}
