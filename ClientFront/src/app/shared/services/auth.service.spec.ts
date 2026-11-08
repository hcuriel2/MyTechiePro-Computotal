import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports:[HttpClientTestingModule]});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  afterEach(()=>TestBed.inject(HttpTestingController).verify());
  it('does not authenticate the MFA challenge response',()=>{
    service.signIn({email:'synthetic@example.com',password:'SyntheticPass1!'} as any).subscribe();
    TestBed.inject(HttpTestingController).expectOne(environment.apiEndpoint+'/auth/login').flush({mfaRequired:true});
    expect(service.userValue).toBeNull();
  });
  it('sends proof when starting factor setup',()=>{
    service.setupMfa('SyntheticPass1!','123456').subscribe();
    const req=TestBed.inject(HttpTestingController).expectOne(environment.apiEndpoint+'/auth/mfa/setup');
    expect(req.request.body).toEqual({currentPassword:'SyntheticPass1!',currentToken:'123456'});req.flush({});
  });
  it('sends proof on factor disable',()=>{
    service.disableMfa('SyntheticPass1!','123456').subscribe();
    const req=TestBed.inject(HttpTestingController).expectOne(environment.apiEndpoint+'/auth/mfa/disable');
    expect(req.request.body.currentToken).toBe('123456');expect(req.request.withCredentials).toBeTrue();req.flush({mfaEnabled:false});
  });
});
