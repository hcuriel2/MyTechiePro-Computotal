import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceTechnicianSelectComponent } from './service-technician-select.component';

describe('ServiceTechnicianSelectComponent', () => {
  let component: ServiceTechnicianSelectComponent;
  let fixture: ComponentFixture<ServiceTechnicianSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceTechnicianSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceTechnicianSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
