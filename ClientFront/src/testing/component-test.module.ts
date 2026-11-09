import { of } from 'rxjs';
import { NgModule } from '@angular/core';
import { AppModule } from '../app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GoogleMapsService } from '../app/shared/services/google-maps.service';
// Mount real templates with real forms/material modules, but no live HTTP backend.
@NgModule({
 imports:[AppModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
 providers:[
  {provide:MatDialogRef,useValue:{close:()=>{}}},
  {provide:MAT_DIALOG_DATA,useValue:{projectID:'mock-project'}},
  {provide:GoogleMapsService,useValue:{loadGoogleMapsScript:()=>Promise.resolve(),getApiKey:()=>of({apiKey:"mock-disabled"}),isLoaded:()=>true}}
 ]
})
export class ComponentTestModule {}
