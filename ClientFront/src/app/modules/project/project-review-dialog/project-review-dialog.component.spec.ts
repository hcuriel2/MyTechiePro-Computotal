import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectReviewDialogComponent } from './project-review-dialog.component';

describe('ProjectReviewDialogComponent', () => {
  let component: ProjectReviewDialogComponent;
  let fixture: ComponentFixture<ProjectReviewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectReviewDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectReviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
