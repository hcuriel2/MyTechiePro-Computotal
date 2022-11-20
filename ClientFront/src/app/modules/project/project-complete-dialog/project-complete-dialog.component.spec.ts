import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCompleteDialogComponent } from './project-complete-dialog.component';

describe('ProjectCompleteDialogComponent', () => {
  let component: ProjectCompleteDialogComponent;
  let fixture: ComponentFixture<ProjectCompleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectCompleteDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectCompleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
