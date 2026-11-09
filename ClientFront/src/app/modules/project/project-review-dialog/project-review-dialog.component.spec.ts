import { ComponentTestModule } from '../../../../testing/component-test.module';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProjectReviewDialogComponent } from './project-review-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ProjectReviewDialogComponent', () => {
  let component: ProjectReviewDialogComponent;
  let fixture: ComponentFixture<ProjectReviewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentTestModule],
      providers: [
        { provide: MatDialogRef, useValue: {close:()=>{}} },
        { provide: MAT_DIALOG_DATA, useValue: {projectID:"mock-project"} },
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

  it('submits the current review contract and closes after success', fakeAsync(() => {
    component.reviewForm.patchValue({rating:5, review:'Great service!'});
    const request = spyOn(window, 'fetch').and.returnValue(Promise.resolve({ok:true,json:()=>Promise.resolve({})} as Response));
    const close = spyOn(component.dialogRef, 'close');
    component.onSubmit();
    tick(2000);
    expect(request).toHaveBeenCalled();
    const options = request.calls.mostRecent().args[1]!;
    expect(JSON.parse(options.body as string)).toEqual({rating:5,review:'Great service!',projectID:'mock-project'});
    expect(close).toHaveBeenCalledWith({rating:5,review:'Great service!',projectID:'mock-project'});
  }));
});