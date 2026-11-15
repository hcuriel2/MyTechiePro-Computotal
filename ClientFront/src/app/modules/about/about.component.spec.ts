import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentTestModule } from '../../../testing/component-test.module';
import { AboutComponent } from './about.component';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';

describe('AboutComponent content permissions', () => {
  let http: HttpTestingController;
  beforeEach(async()=>{
    await TestBed.configureTestingModule({imports:[ComponentTestModule]}).compileComponents();
    http=TestBed.inject(HttpTestingController);
  });
  afterEach(()=>http.verify());
  it('renders public content without an edit button for a Read-only account',()=>{
    TestBed.inject(AuthService).setUserValue({userType:'Admin',adminRole:'Read-only'} as any);
    const fixture=TestBed.createComponent(AboutComponent);fixture.detectChanges();
    http.expectOne(environment.apiEndpoint+'/aboutus').flush({content:'Public content'});fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Public content');
    expect(fixture.nativeElement.querySelector('#edit-content-btn')).toBeNull();
  });
  it('allows Editor partial updates and keeps draft on a rejected save',()=>{
    spyOn(console, 'error');
    TestBed.inject(AuthService).setUserValue({userType:'Admin',adminRole:'Editor'} as any);
    const fixture=TestBed.createComponent(AboutComponent);fixture.detectChanges();
    http.expectOne(environment.apiEndpoint+'/aboutus').flush({content:'Original'});
    const component=fixture.componentInstance;component.startEditing();component.draft='Updated';component.save();
    const req=http.expectOne(environment.apiEndpoint+'/aboutus');
    expect(req.request.body).toEqual({content:'Updated'});expect(req.request.withCredentials).toBeTrue();
    req.flush({},{status:403,statusText:'Forbidden'});
    expect(component.isEditing).toBeTrue();expect(component.content).toBe('Original');expect(component.isSaving).toBeFalse();
  });
});
