import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';
import { ProjectService } from '../../../../api/project.service';
import { HeroBoldComponent } from "../../ui/sections/hero-bold/hero-bold.component";
import { AboutSectionComponent } from '../../ui/sections/about-section/about-section.component';
import { MilestonesSectionComponent } from '../../ui/sections/milestones-section/milestones-section.component';
import { PartnersSectionComponent } from '../../ui/sections/partners-section/partners-section.component';
import { ServicesSectionComponent } from "../../ui/sections/services-section/services-section.component";
import { TestimonialsSectionComponent } from '../../ui/sections/testimonails-section/testimonails-section.component';

@Component({
  selector: 'app-home-page-engine',
  standalone: true,
  imports: [
    CommonModule,
    HeroBoldComponent,
    PartnersSectionComponent,
    AboutSectionComponent,
    MilestonesSectionComponent,
    ServicesSectionComponent,
    TestimonialsSectionComponent
],
  templateUrl: './home-page-engine.component.html',
  styleUrl: './home-page-engine.component.scss',
})
export class HomePageEngineComponent {
  private projectService = inject(ProjectService);
  
  // We extract jsonContent directly from the RAM
  siteData$: Observable<any> = this.projectService.siteData$.pipe(
    map(project => project?.jsonContent)
  );

  /**
   * Accesses the 'home-components' array inside jsonContent
   */
  getSection(data: any, type: string) {
    if (!data?.pages?.home?.['home-components']) return null;
    
    // Finds the object in the array that has the key (e.g., 'hero-bold')
    const sectionWrapper = data.pages.home['home-components'].find((s: any) => s[type]);
    return sectionWrapper ? sectionWrapper[type] : null;
  }
}