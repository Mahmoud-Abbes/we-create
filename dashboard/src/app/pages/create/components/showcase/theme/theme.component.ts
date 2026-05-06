import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateShowcaseService } from '../../../../../services/projects/create.showcase.service';

@Component({
  selector: 'app-theme',
  imports: [CommonModule, FormsModule],
  templateUrl: './theme.component.html',
  styleUrl: './theme.component.scss',
})
export class ThemeComponent implements OnInit {
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  themeData: any;

  constructor(private showcaseService: CreateShowcaseService) {}

  ngOnInit() {
    this.themeData = this.showcaseService.getTheme();
  }

  saveToService() {
    this.showcaseService.setTheme(this.themeData);
  }

  resetPrimary() {
    this.themeData.primaryColor = '';
    this.saveToService();
  }

  resetSecondary() {
    this.themeData.secondaryColor = '';
    this.saveToService();
  }

  resetText() {
    this.themeData.accentColor = '';
    this.saveToService();
  }

  onNext() {
    this.saveToService();

    console.log('--- Assembler Output (WeCreate Theme) ---');
    console.log(this.showcaseService.getFullProject());
    console.log('-------------------------------------------');

    this.next.emit();
  }

  onBack() {
    this.saveToService();
    this.back.emit();
  }
}
