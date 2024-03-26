import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceSurveyComponent } from './modules/service-survey/service-survey.component';
import { ServiceSurveyModuleComponent } from './modules/service-survey-module/service-survey-module.component';
import { ServiceTechnicianSelectComponent } from './modules/service-technician-select/service-technician-select.component';
import { HomeComponent } from './modules/home/home.component';
import { ProjectComponent } from './modules/project/project.component';
import { ProjectsListComponent } from './modules/projects-list/projects-list.component';
import { SignUpComponent } from './modules/sign-up/sign-up.component';
import { AboutComponent } from './modules/about/about.component';
import { ContactUsComponent } from './modules/contact-us/contact-us.component';
import { SettingsComponent } from './modules/settings/settings.component';
import { ResetPasswordComponent } from './modules/reset-password/reset-password.component';
import { ProDetailsComponent } from './modules/pro-details/pro-details.component';
import { ProProfileComponent } from './modules/pro-profile/pro-profile.component';


const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'contact-us', component: ContactUsComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: 'service-survey', component: ServiceSurveyComponent },
    { path: 'pro-profile', component: ProProfileComponent },
    { path: 'service-survey-module', component: ServiceSurveyModuleComponent },
    {
        path: 'service-tech-select',
        component: ServiceTechnicianSelectComponent,
    },
    { path: 'project/:id', component: ProjectComponent },
    { path: 'projects', component: ProjectsListComponent },
    {
        path: 'service-tech-select',
        component: ServiceTechnicianSelectComponent,
    },
    { path: 'project/:id', component: ProjectComponent },
    { path: 'projects', component: ProjectsListComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'resetPassword/:id', component: ResetPasswordComponent },
    { path: 'proDetails', component: ProDetailsComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
