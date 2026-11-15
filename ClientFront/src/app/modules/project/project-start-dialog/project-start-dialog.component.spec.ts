import { ComponentTestModule } from '../../../../testing/component-test.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectStartDialogComponent } from './project-start-dialog.component';

describe('ProjectStartDialogComponent', () => {
  let component: ProjectStartDialogComponent;
  let fixture: ComponentFixture<ProjectStartDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentTestModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectStartDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
