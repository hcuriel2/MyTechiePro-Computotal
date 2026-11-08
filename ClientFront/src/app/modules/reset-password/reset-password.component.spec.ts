import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subject, BehaviorSubject } from 'rxjs';
import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentTestModule } from '../../../testing/component-test.module';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';

describe('ResetPasswordComponent recovery authorization', () => {
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let http: HttpTestingController;
  let route: any;
  let router: any;
  let location: any;
  const token = 'a'.repeat(64);
  beforeEach(async () => {
    route = {snapshot:{params:{id:'000000000000000000000001'}},fragment:new BehaviorSubject<string | null>(null)};
    router = {events:new Subject(),navigateByUrl:jasmine.createSpy('navigateByUrl')};
    location = {path:()=>'/resetPassword/mock',replaceState:jasmine.createSpy('replaceState')};
    await TestBed.configureTestingModule({imports:[ComponentTestModule],providers:[
      {provide:ActivatedRoute,useValue:route},{provide:Router,useValue:router},{provide:Location,useValue:location}
    ]}).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  function create(fragment: string | null) {
    route.fragment.next(fragment);
    fixture=TestBed.createComponent(ResetPasswordComponent);fixture.detectChanges();
    router.events.next(new NavigationEnd(1, '/resetPassword/mock', '/resetPassword/mock'));
    fixture.componentInstance.formGroup.patchValue({password:'NewPassword1!',confirmPassword:'NewPassword1!'});
    return fixture.componentInstance;
  }
  it('prevents submission when no recovery credential is present', () => {
    const component=create(null);component.onSubmit();
    http.expectNone(req=>req.method==='PUT');
    expect(fixture.nativeElement.textContent).toContain('Request a new link');
  });
  it('accepts a newly opened link when Angular reuses the same recovery page', () => {
    const component=create(null);
    route.fragment.next('token='+token);
    router.events.next(new NavigationEnd(2, '/resetPassword/mock', '/resetPassword/mock'));
    expect(component.resetToken).toBe(token);
    expect(location.replaceState).toHaveBeenCalledWith('/resetPassword/mock');
  });
  it('reads the fragment credential, removes it from history, and submits it in the body', () => {
    const component=create('token='+token);component.onSubmit();component.onSubmit();
    expect(location.replaceState).toHaveBeenCalledWith('/resetPassword/mock');
    const req=http.expectOne(environment.apiEndpoint+'/users/reset/000000000000000000000001');
    expect(req.request.method).toBe('PUT');expect(req.request.body.token).toBe(token);
    expect(req.request.url).not.toContain(token);
    req.flush({message:'Password updated. Please sign in.'});
    expect(TestBed.inject(AuthService).userValue).toBeNull();
    expect(component.resetToken).toBe('');expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });
  it('shows a recoverable error for rejected credentials', () => {
    const component=create('token='+token);component.onSubmit();
    http.expectOne(req=>req.method==='PUT').flush({message:'Invalid link'},{status:400,statusText:'Bad Request'});
    fixture.detectChanges();expect(component.isSaving).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Request a new link');
  });
});
