import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateShowcaseService } from '../../../../../services/projects/create.showcase.service';

@Component({
  selector: 'app-about',
  imports: [CommonModule, FormsModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  aboutData: any;

  errors = {
    isBrandStoryEmpty: false,
  };

  constructor(private showcaseService: CreateShowcaseService) {}

  ngOnInit() {
    this.aboutData = this.showcaseService.getAbout();
  }

  saveToService() {
    this.showcaseService.setAbout(this.aboutData);
  }

  onNext() {
    if (this.aboutData.show) {
      if (!this.aboutData.brandStory?.trim()) {
        this.errors.isBrandStoryEmpty = true;
        return;
      }
    } else {
      this.aboutData.title = '';
      this.aboutData.brandStory = '';
      this.errors.isBrandStoryEmpty = false;
    }

    this.saveToService();
    this.next.emit();
  }

  onBack() {
    this.saveToService();
    this.back.emit();
  }
}