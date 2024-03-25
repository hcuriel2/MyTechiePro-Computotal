import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { createTranslateHttpLoader } from './app.factories';
import { HomeComponent } from './modules/home/home.component';
import { ServiceSurveyComponent } from './modules/service-survey/service-survey.component';
import { ServiceSurveyModuleComponent } from './modules/service-survey-module/service-survey-module.component';
import { ServiceSurveyModuleSummaryComponent } from './modules/service-survey-module-summary/service-survey-module-summary.component';
import { ServiceTechnicianSelectComponent } from './modules/service-technician-select/service-technician-select.component';
import { ProjectComponent } from './modules/project/project.component';
import { ProjectsListComponent } from './modules/projects-list/projects-list.component';
import { ContactUsComponent } from './modules/contact-us/contact-us.component';
import { AboutComponent } from './modules/about/about.component';
import { SettingsComponent } from './modules/settings/settings.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SignInComponent } from './modules/sign-in/sign-in.component';
import { SignUpComponent } from './modules/sign-up/sign-up.component';
import { ProjectStartDialogComponent } from './modules/project/project-start-dialog/project-start-dialog.component';
import { ProjectCompleteDialogComponent } from './modules/project/project-complete-dialog/project-complete-dialog.component';
import { ProjectPayDialogComponent } from './modules/project/project-pay-dialog/project-pay-dialog.component';

import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { ProjectReviewDialogComponent } from './modules/project/project-review-dialog/project-review-dialog.component';
import { ResetPasswordComponent } from './modules/reset-password/reset-password.component';
import { ContactUsDialogComponent } from './modules/contact-us/contact-us-dialog/contact-us-dialog/contact-us-dialog.component';
import { ProProfileComponent } from './modules/pro-profile/pro-profile.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        ServiceSurveyComponent,
        ServiceSurveyModuleComponent,
        ServiceSurveyModuleSummaryComponent,
        ServiceTechnicianSelectComponent,
        ProjectComponent,
        ProjectsListComponent,
        ContactUsComponent,
        AboutComponent,
        SignInComponent,
        SignUpComponent,
        ProjectStartDialogComponent,
        ProjectCompleteDialogComponent,
        ProjectPayDialogComponent,
        ProjectReviewDialogComponent,
        SettingsComponent,
        ResetPasswordComponent,
        ContactUsDialogComponent,
        ProProfileComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        SharedModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateHttpLoader,
                deps: [HttpClient],
            },
        }),
        BrowserAnimationsModule,
        NgbModule,
        GooglePlaceModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
