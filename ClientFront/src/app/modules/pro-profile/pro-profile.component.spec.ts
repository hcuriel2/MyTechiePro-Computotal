import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProProfileComponent } from './pro-profile.component';

describe('ProProfileComponent', () => {
  let component: ProProfileComponent;
  let fixture: ComponentFixture<ProProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
