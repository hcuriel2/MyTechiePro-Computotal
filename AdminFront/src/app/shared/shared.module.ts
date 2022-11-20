import {
    CommonModule,
    DecimalPipe
} from '@angular/common';
import {
    MatButtonModule
} from '@angular/material/button';
import {
    MatButtonToggleModule
} from '@angular/material/button-toggle';
import {
    MatCardModule
} from '@angular/material/card';
import {
    MatCheckboxModule
} from '@angular/material/checkbox';
import {
    MatDatepickerModule
} from '@angular/material/datepicker';
import {
    MatDialog, MatDialogModule
} from '@angular/material/dialog';
import {
    MatExpansionModule
} from '@angular/material/expansion';
import {
    MatIconModule,
    MatIconRegistry
} from '@angular/material/icon';
import {
    MatInputModule
} from '@angular/material/input';
import {
    MatListModule
} from '@angular/material/list';
import {
    MatMenuModule
} from '@angular/material/menu';
import {
    MatProgressBarModule
} from '@angular/material/progress-bar';
import {
    MatProgressSpinnerModule
} from '@angular/material/progress-spinner';
import {
    MatSelectModule
} from '@angular/material/select';
import {
    MatSidenavModule
} from '@angular/material/sidenav';
import {
    MatSlideToggleModule
} from '@angular/material/slide-toggle';
import {
    MatSnackBarModule
} from '@angular/material/snack-bar';
import {
    MatStepperModule
} from '@angular/material/stepper';
import {
    MatTabsModule
} from '@angular/material/tabs';
import {
    MatToolbarModule
} from '@angular/material/toolbar';
import {
    MatTooltipModule
} from '@angular/material/tooltip';
import {
    TranslateModule
} from '@ngx-translate/core';
import {
    FormsModule,
} from '@angular/forms';
import {
    NgModule,
    ModuleWithProviders
} from '@angular/core';


@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDialogModule,
        MatExpansionModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatStepperModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        TranslateModule
    ],
    declarations: [
    ],
    exports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDialogModule,
        MatExpansionModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatStepperModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        TranslateModule
    ],
    providers: [
        DecimalPipe,
        MatDialog,
        MatIconRegistry,
    ]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders<SharedModule> {
        return {
            ngModule: SharedModule,
            providers: []
        };
    }
}
