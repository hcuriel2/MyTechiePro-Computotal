import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { SettingsComponent } from './settings.component';
describe('Client MFA proof handling',()=>{
 it('supplies fresh proof for setup and confirmation and clears it afterward',()=>{
  const auth={setupMfa:jasmine.createSpy('setup').and.returnValue(of({secret:'synthetic',qrDataUrl:'data:'})),
   confirmMfa:jasmine.createSpy('confirm').and.returnValue(of({mfaEnabled:true}))};
  const component=new SettingsComponent(new FormBuilder(),{} as any,auth as any,{} as any);
  component.currentPassword='SyntheticPass1!';component.currentToken='123456';
  component.startMfaSetup(true);expect(auth.setupMfa).toHaveBeenCalledWith('SyntheticPass1!','123456');
  component.confirmCode='654321';component.confirmMfaSetup();
  expect(auth.confirmMfa).toHaveBeenCalledWith('654321','SyntheticPass1!','123456');
  expect(component.currentPassword).toBe('');expect(component.currentToken).toBe('');
 });
 it('clears proof and pending setup data on cancel',()=>{
  const component=new SettingsComponent(new FormBuilder(),{} as any,{} as any,{} as any);
  component.currentPassword='SyntheticPass1!';component.currentToken='123456';component.manualSecret='synthetic';
  component.cancelMfaSetup();expect(component.currentPassword).toBe('');expect(component.currentToken).toBe('');expect(component.manualSecret).toBe('');
 });
});
