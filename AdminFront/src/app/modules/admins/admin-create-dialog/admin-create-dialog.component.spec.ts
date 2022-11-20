import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCreateDialogComponent } from './admin-create-dialog.component';

describe('AdminCreateDialogComponent', () => {
  let component: AdminCreateDialogComponent;
  let fixture: ComponentFixture<AdminCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminCreateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
