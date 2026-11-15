import { BehaviorSubject, of } from 'rxjs';
import { AppComponent } from './app.component';

describe('AppComponent session state', () => {
  let app: AppComponent;
  let auth: any;
  let maps: any;
  let translate: any;
  beforeEach(() => {
    auth = {user:new BehaviorSubject<any>(null),isSessionChecked:false,checkSession:jasmine.createSpy('checkSession').and.returnValue(of(null))};
    maps = {loadGoogleMapsScript:jasmine.createSpy('maps').and.returnValue(Promise.resolve())};
    translate = {setDefaultLang:jasmine.createSpy('default'),use:jasmine.createSpy('use')};
    app = new AppComponent({} as any, {} as any, {} as any, auth,
      {detectChanges:()=>{}} as any, translate, maps);
  });
  it('initializes the visitor and language state', () => {
    expect(app.user).toBeNull(); expect(app.isProfessional).toBeFalse();
    expect(translate.setDefaultLang).toHaveBeenCalledWith('en-us');
  });
  it('checks a session once when not previously checked', () => {
    app.ngOnInit(); expect(auth.checkSession).toHaveBeenCalledTimes(1);
  });
  it('tracks Professional sign-in and sign-out', () => {
    auth.isSessionChecked=true; app.ngOnInit();
    auth.user.next({userType:'Professional'}); expect(app.isProfessional).toBeTrue();
    auth.user.next(null); expect(app.isProfessional).toBeFalse();
    expect(auth.checkSession).not.toHaveBeenCalled();
  });
});