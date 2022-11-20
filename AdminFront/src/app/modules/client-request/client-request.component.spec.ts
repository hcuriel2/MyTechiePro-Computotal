import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRequestComponent } from './client-request.component';

describe('ClientRequestComponent', () => {
  let component: ClientRequestComponent;
  let fixture: ComponentFixture<ClientRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
