import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { CategoryEnum } from 'src/app/shared/enums/Category.enum';
import { Category } from 'src/app/shared/models/category';
import { Service } from 'src/app/shared/models/service';
import { CategoryService } from 'src/app/shared/services/category.service';
import { Ng2SearchPipe } from 'ng2-search-filter';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/models/user';
import { Buffer } from 'buffer'
import { MfaDto } from 'src/app/shared/models/mfaDto';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
    public isCustomer = true; // If technician, re-route to tech page.
    public categories: Category[];
    public readonly CATEGORY_ENUM: typeof CategoryEnum;
    public searchQuery: string;
    public showResults: boolean;
    public mfa: MfaDto;
    public hasMfa = false;
    public token = ""
    private user: User;
    public verifyStatus= '';
    public mfaRequested= false;
    public formDisabled = true;
    public userId = '';
    
    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService
    ) {
        this.hasMfa = !!this.authService.userValue?.secret;
    }

    // Displays homepage to client, if user is technician projects page is displayed instead
    public ngOnInit(): void {
        this.user = this.authService.userValue ?? this.user;
        if (!this.user) {
            console.error('error user not loaded')
            return;
        }
        this.populateForm(this.user);


        let temp = this.authService.user.subscribe();
        console.log('temp called', temp);
    }

    public populateForm(user: User) {
                if (user) {
                    this.userId = user._id;
                    const firstName = document.getElementById('firstName') as HTMLInputElement;
                    const lastName = document.getElementById('lastName') as HTMLInputElement;
                    const email = document.getElementById('email') as HTMLInputElement;
                    const street = document.getElementById('street') as HTMLInputElement;
                    const city = document.getElementById('city') as HTMLInputElement;
                    const country = document.getElementById('country') as HTMLInputElement;
                    const postalCode = document.getElementById('postalCode') as HTMLInputElement;
                    
                    if (firstName) firstName.value = user.firstName || '';
                    if (lastName) lastName.value = user.lastName || '';
                    if (email) email.value = user.email || '';
                    if (street) street.value = user.address?.street;
                    if (city) city.value = user.address?.city;
                    if (country) country.value = user.address?.country;
                    if (postalCode) postalCode.value = user.address?.postalCode;
                }


    }

    enableForm(): void {
         this.formDisabled = false;
    }

    submitForm(): void {
        const updatedUserInfo = {
            firstName: (document.getElementById('firstName') as HTMLInputElement).value,
            lastName: (document.getElementById('lastName') as HTMLInputElement).value,
            email: (document.getElementById('email') as HTMLInputElement).value,
            street: (document.getElementById('street') as HTMLInputElement).value,
            city: (document.getElementById('city') as HTMLInputElement).value,
            country: (document.getElementById('country') as HTMLInputElement).value,
            postalCode: (document.getElementById('postalCode') as HTMLInputElement).value,
        }

        this.authService.updateUserSettings(this.userId, updatedUserInfo).subscribe({
            next: (response) => {
                console.log('Update successful', response);
            },
            error: (error) => {
                console.error('Error updating user info', error);
            }
        })
    }
}
