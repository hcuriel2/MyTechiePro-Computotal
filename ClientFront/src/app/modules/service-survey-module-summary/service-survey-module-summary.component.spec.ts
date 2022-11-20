import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceSurveyModuleSummaryComponent } from './service-survey-module-summary.component';

describe('ServiceSurveyModuleSummaryComponent', () => {
  let component: ServiceSurveyModuleSummaryComponent;
  let fixture: ComponentFixture<ServiceSurveyModuleSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceSurveyModuleSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceSurveyModuleSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
