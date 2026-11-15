import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ContactUsService } from './contact-us.service';

describe('ContactUsService', () => {
  let service: ContactUsService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports:[HttpClientTestingModule]});
    service = TestBed.inject(ContactUsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
