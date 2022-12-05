import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { UsersComponent } from './modules/users/users.component';
import { AdminsComponent } from './modules/admins/admins.component';
import { ProjectsComponent } from './modules/projects/projects.component';
import { CreateCategoryComponent } from './modules/create-category/create-category.component'; //this is new

// import { CreateCategoryComponent } from './modules/create-category/create-category.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatSortModule } from '@angular/material/sort';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CustomersComponent } from './modules/customers/customers.component';
import { ProsComponent } from './modules/pros/pros.component';
import { CustomerDetailsComponent } from './modules/customer-details/customer-details.component';
import { MatTableModule } from '@angular/material/table';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ProDetailsComponent } from './modules/pro-details/pro-details.component';
import { ClientRequestComponent } from './modules/client-request/client-request.component';

import { HttpClientModule } from '@angular/common/http';
import { AdminCreateDialogComponent } from './modules/admins/admin-create-dialog/admin-create-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    UsersComponent,
    CustomersComponent,
    ProsComponent,
    AdminsComponent,
    CustomerDetailsComponent,
    ProDetailsComponent,
    ProjectsComponent,
    ClientRequestComponent,
    AdminCreateDialogComponent,
    CreateCategoryComponent, //this is new
  ],
  imports: [
    BrowserModule,
    SharedModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    FlexLayoutModule,
    MatTableModule,
    ScrollingModule,
    HttpClientModule,
    MatSortModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
