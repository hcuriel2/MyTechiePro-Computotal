import { ComponentTestModule } from '../../../testing/component-test.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceSurveyModuleComponent } from './service-survey-module.component';

describe('ServiceSurveyModuleComponent', () => {
  let component: ServiceSurveyModuleComponent;
  let fixture: ComponentFixture<ServiceSurveyModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentTestModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceSurveyModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
