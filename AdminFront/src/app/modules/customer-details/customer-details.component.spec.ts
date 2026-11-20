import { ComponentTestModule } from '../../../testing/component-test.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDetailsComponent } from './customer-details.component';

describe('CustomerDetailsComponent', () => {
  let component: CustomerDetailsComponent;
  let fixture: ComponentFixture<CustomerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentTestModule]
    })
    .compileComponents();
  });

  let priorState: any;
  beforeEach(() => {
    priorState = history.state;
    const person = {_id:'mock-person',firstName:'Mock',lastName:'Person',address:{street:'Sample',city:'Sample',country:'Sample',postalCode:'000'},skills:[]};
    history.replaceState({...person,pro:person}, '');
    fixture = TestBed.createComponent(CustomerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => history.replaceState(priorState, ''));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
