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
import { CreateCategoryComponent } from './modules/create-category/create-category.component'; 
import { EditAboutUsComponent } from './modules/edit-about-us/edit-about-us.component';
import { AdminRoleGuard } from './shared/admin-role.guard';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AdminRoleGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AdminRoleGuard] },
  { path: 'projects', component: ProjectsComponent, canActivate: [AdminRoleGuard] },
  {
    path: 'customers',
    component: CustomersComponent,
    canActivate: [AdminRoleGuard],
    children: [{ path: ':id', component: CustomerDetailsComponent }],
  },
  {
    path: 'pros',
    component: ProsComponent,
    canActivate: [AdminRoleGuard],
    children: [{ path: ':id', component: ProDetailsComponent }],
  },
  { path: 'admins', component: AdminsComponent, canActivate: [AdminRoleGuard] },
  { path: 'customerDetails', component: CustomerDetailsComponent, canActivate: [AdminRoleGuard] },
  { path: 'proDetails', component: ProDetailsComponent, canActivate: [AdminRoleGuard] },
  { path: 'client-request', component: ClientRequestComponent, canActivate: [AdminRoleGuard] },
  { path: 'create-category', component: CreateCategoryComponent, canActivate: [AdminRoleGuard] },
  { path: 'edit-about-us', component: EditAboutUsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
