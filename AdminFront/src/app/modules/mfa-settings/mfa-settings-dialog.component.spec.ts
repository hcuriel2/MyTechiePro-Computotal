import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MfaSettingsDialogComponent } from './mfa-settings-dialog.component';
import { environment } from 'src/environments/environment';
describe('Admin MFA fresh proof',()=>{
 let component:MfaSettingsDialogComponent, http:HttpTestingController;
 beforeEach(()=>{
  TestBed.configureTestingModule({imports:[HttpClientTestingModule]});
  http=TestBed.inject(HttpTestingController);
  component=new MfaSettingsDialogComponent(TestBed.inject(HttpClient), {close:()=>{}} as any,{mfaEnabled:true});
  component.currentPassword='SyntheticPass1!';component.currentToken='123456';
 });
 afterEach(()=>http.verify());
 it('sends fresh proof for replacement setup',()=>{
  component.startSetup(true);
  const req=http.expectOne(environment.apiEndpoint+'/auth/mfa/setup');
  expect(req.request.body).toEqual({currentPassword:'SyntheticPass1!',currentToken:'123456'});
  expect(req.request.withCredentials).toBeTrue();req.flush({secret:'synthetic',qrDataUrl:'data:'});
  expect(component.enrolling).toBeTrue();
 });
 it('sends old-factor proof and new code on confirmation then clears credentials',()=>{
  component.confirmCode='654321';component.confirmSetup();
  const req=http.expectOne(environment.apiEndpoint+'/auth/mfa/confirm');
  expect(req.request.body).toEqual({token:'654321',currentPassword:'SyntheticPass1!',currentToken:'123456'});
  req.flush({mfaEnabled:true});expect(component.currentPassword).toBe('');expect(component.currentToken).toBe('');
 });
 it('sends proof for disable and clears it after success',()=>{
  component.disable();const req=http.expectOne(environment.apiEndpoint+'/auth/mfa/disable');
  expect(req.request.body.currentToken).toBe('123456');req.flush({mfaEnabled:false});
  expect(component.mfaEnabled).toBeFalse();expect(component.currentPassword).toBe('');
 });
});
