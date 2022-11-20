import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProDetailsComponent } from './pro-details.component';

describe('ProDetailsComponent', () => {
  let component: ProDetailsComponent;
  let fixture: ComponentFixture<ProDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
