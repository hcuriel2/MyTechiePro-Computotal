import { NgModule } from '@angular/core';
import { AppModule } from '../app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Mount real templates with real forms/material modules, but no live HTTP backend.
@NgModule({
 imports:[AppModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
 providers:[
  {provide:MatDialogRef,useValue:{close:()=>{}}},
  {provide:MAT_DIALOG_DATA,useValue:{projectID:'mock-project'}},

 ]
})
export class ComponentTestModule {}
