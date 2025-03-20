import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AboutUsService } from './about-us.service';

describe('AboutUsService', () => {
  let service: AboutUsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AboutUsService],
    });
    service = TestBed.inject(AboutUsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch About Us content', () => {
    const mockResponse = { content: 'This is the About Us content.' };

    service.getAboutUsContent().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(service['API_URL']);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});