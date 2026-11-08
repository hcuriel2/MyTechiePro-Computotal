import { EMPTY, of } from 'rxjs';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AdminAccessService } from './shared/services/admin-access.service';
import { environment } from '../environments/environment';

describe('AppComponent session access', () => {
  let app: AppComponent;
  let http: HttpTestingController;
  let router: any;
  let name: HTMLElement;
  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    http = TestBed.inject(HttpTestingController);
    router = {url: '/signup-controls', navigateByUrl: jasmine.createSpy('navigateByUrl')};
    app = new AppComponent({observe: () => EMPTY} as any, TestBed.inject(HttpClient), router, new AdminAccessService());
    name = document.createElement('span'); name.id = 'fullName'; document.body.appendChild(name);
  });
  afterEach(() => {http.verify(); name.remove();});
  it('defaults to limited access before the session resolves', () => expect(app.adminRole).toBe('Read-only'));
  it('redirects an Editor away from administrative controls', () => {
    app.ngAfterViewInit();
    http.expectOne(environment.apiEndpoint + '/auth/checkSession').flush({userType:'Admin',adminRole:'Editor',firstName:'Mock',lastName:'Editor'});
    expect(app.adminRole).toBe('Editor');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/edit-about-us');
  });
  it('preserves full access for an existing Admin without an explicit role', () => {
    app.ngAfterViewInit();
    http.expectOne(environment.apiEndpoint + '/auth/checkSession').flush({userType:'Admin',firstName:'Mock',lastName:'Admin'});
    expect(app.adminRole).toBe('Admin');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});