import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectPayDialogComponent } from './project-pay-dialog.component';

describe('ProjectPayDialogComponent', () => {
  let component: ProjectPayDialogComponent;
  let fixture: ComponentFixture<ProjectPayDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectPayDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectPayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
