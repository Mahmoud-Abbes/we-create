import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitContact } from './split-contact';

describe('SplitContact', () => {
  let component: SplitContact;
  let fixture: ComponentFixture<SplitContact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitContact]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplitContact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
