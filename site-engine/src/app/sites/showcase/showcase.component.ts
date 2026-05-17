import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProjectService } from '../../api/project.service';
import { ShowcaseThemeService } from './services/showcase-theme.service';
import { HeaderEngineComponent } from './engine/header-engine/header-engine.component';
import { FooterEngineComponent } from "./engine/footer-engine/footer-engine.component";

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderEngineComponent, FooterEngineComponent],
  providers: [ShowcaseThemeService],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss',
})
export class ShowcaseComponent implements OnInit, OnDestroy {

  private projectService = inject(ProjectService);
  private themeService = inject(ShowcaseThemeService);
  private sub?: Subscription;

  ngOnInit() {
    this.sub = this.projectService.siteData$.subscribe((data: any) => {
      if (data?.jsonContent?.theme) {
        this.themeService.applyShowcaseStyles(data.jsonContent.theme);
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
