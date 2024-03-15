import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectReviewDialogComponent } from './project-review-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ProjectReviewDialogComponent', () => {
  let component: ProjectReviewDialogComponent;
  let fixture: ComponentFixture<ProjectReviewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, NoopAnimationsModule],
      declarations: [ProjectReviewDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectReviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog on cancel', () => {
    let spy = spyOn(component.dialogRef, 'close');
    component.onCancel();
    expect(spy).toHaveBeenCalled();
  });

  it('should submit valid form', () => {
    component.reviewForm.controls['rating'].setValue(5);
    component.reviewForm.controls['comment'].setValue('Great service!');
    let spy = spyOn(component.dialogRef, 'close');
    component.onSubmit();
    expect(spy).toHaveBeenCalledWith({rating: 5, comment: 'Great service!'});
  });
});
