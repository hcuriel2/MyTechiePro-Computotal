import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { UsersComponent } from './modules/users/users.component';
import { ProjectsComponent } from './modules/projects/projects.component';
import { CustomersComponent } from './modules/customers/customers.component';
import { ProsComponent } from './modules/pros/pros.component';
import { AdminsComponent } from './modules/admins/admins.component';
import { CustomerDetailsComponent } from './modules/customer-details/customer-details.component';
import { ProDetailsComponent } from './modules/pro-details/pro-details.component';
import { ClientRequestComponent } from './modules/client-request/client-request.component';

import { CreateCategoryComponent } from './modules/create-category/create-category.component'; //this is new

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'users', component: UsersComponent },
  { path: 'projects', component: ProjectsComponent },
  {
    path: 'customers',
    component: CustomersComponent,
    children: [{ path: ':id', component: CustomerDetailsComponent }],
  },
  {
    path: 'pros',
    component: ProsComponent,
    children: [{ path: ':id', component: ProDetailsComponent }],
  },
  { path: 'admins', component: AdminsComponent },
  { path: 'customerDetails', component: CustomerDetailsComponent },
  { path: 'proDetails', component: ProDetailsComponent },
  { path: 'client-request', component: ClientRequestComponent },
  { path: 'create-category', component: CreateCategoryComponent }, //this is new
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
