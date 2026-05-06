import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateShowcaseService } from '../../../../../services/projects/create.showcase.service';

@Component({
  selector: 'app-milestones',
  imports: [CommonModule, FormsModule],
  templateUrl: './milestones.component.html',
  styleUrl: './milestones.component.scss',
})
export class MilestonesComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  milestonesData: any;

  errors = {
    isAchievementsDescriptionEmpty: false,
  };

  constructor(private showcaseService: CreateShowcaseService) {}

  ngOnInit() {
    this.milestonesData = this.showcaseService.getMilestones();
  }

  saveToService() {
    this.showcaseService.setMilestones(this.milestonesData);
  }

  onNext() {
    if (this.milestonesData.show) {
      if (!this.milestonesData.achievementsDescription?.trim()) {
        this.errors.isAchievementsDescriptionEmpty = true;
        return;
      }
    } else {
      this.milestonesData.achievementsDescription = '';
      this.errors.isAchievementsDescriptionEmpty = false;
    }

    this.saveToService();

    console.log('--- Assembler Output (WeCreate Milestones) ---');
    console.log(this.showcaseService.getFullProject());
    console.log('-------------------------------------------');

    this.next.emit();
  }

  onBack() {
    this.saveToService();
    this.back.emit();
  }
}
