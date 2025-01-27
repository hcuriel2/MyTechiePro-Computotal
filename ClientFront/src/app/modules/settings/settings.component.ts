// import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { Router, ActivatedRoute } from '@angular/router';
// import { first } from 'rxjs/operators';
// import { CategoryEnum } from 'src/app/shared/enums/Category.enum';
// import { Category } from 'src/app/shared/models/category';
// import { Service } from 'src/app/shared/models/service';
// import { CategoryService } from 'src/app/shared/services/category.service';
// import { Ng2SearchPipe } from 'ng2-search-filter';
// import { AuthService } from 'src/app/shared/services/auth.service';
// import { User } from 'src/app/shared/models/user';
// import { Buffer } from 'buffer'
// import { MfaDto } from 'src/app/shared/models/mfaDto';

// @Component({
//     selector: 'app-settings',
//     templateUrl: './settings.component.html',
//     styleUrls: ['./settings.component.scss'],
// })
// export class SettingsComponent implements OnInit {
//     public isCustomer = true; // If technician, re-route to tech page.
//     public categories: Category[];
//     public readonly CATEGORY_ENUM: typeof CategoryEnum;
//     public searchQuery: string;
//     public showResults: boolean;
//     public mfa: MfaDto;
//     public hasMfa = false;
//     public token = ""
//     private user: User | null;
//     public verifyStatus= '';
//     public mfaRequested= false;
//     public formDisabled = true;
//     public editing: boolean = false; 
//     public userId = '';
    
//     constructor(
//         private changeDetectorRef: ChangeDetectorRef,
//         private router: Router,
//         private route: ActivatedRoute,
//         private authService: AuthService
//     ) {
//         this.hasMfa = !!this.authService.userValue?.secret;
//     }

//     public ngOnInit(): void {
//         this.authService.user.subscribe(user => {
//             this.user = user;

//             if (user) {
//                 this.populateForm(user);
//             }
//         })
//     }


//     // user form
//     public populateForm(user: User) {
//         if (user) {
//             this.userId = user._id;
//             const firstName = document.getElementById('firstName') as HTMLInputElement;
//             const lastName = document.getElementById('lastName') as HTMLInputElement;
//             const email = document.getElementById('email') as HTMLInputElement;
//             const street = document.getElementById('street') as HTMLInputElement;
//             const city = document.getElementById('city') as HTMLInputElement;
//             const country = document.getElementById('country') as HTMLInputElement;
//             const postalCode = document.getElementById('postalCode') as HTMLInputElement;
                    
//             if (firstName) firstName.value = user.firstName || '';
//             if (lastName) lastName.value = user.lastName || '';
//             if (email) email.value = user.email || '';
//             if (street) street.value = user.address?.street;
//             if (city) city.value = user.address?.city;
//             if (country) country.value = user.address?.country;
//             if (postalCode) postalCode.value = user.address?.postalCode;
//         }
//     }

//     enableForm(): void {
//          this.formDisabled = false;
//          this.editing = true;
//          this.changeDetectorRef.detectChanges();
//     }

//     cancelEdit(): void {
//         this.formDisabled = true;
//         this.editing = false;
//         if (this.user !== null) {
//             this.populateForm(this.user);
//         } else {
//             console.error("User data is unavailable");
//         }
//         this.changeDetectorRef.detectChanges();
//     }
    

//     submitForm(): void {
        
//         const updatedUserInfo = {
//             firstName: (document.getElementById('firstName') as HTMLInputElement).value,
//             lastName: (document.getElementById('lastName') as HTMLInputElement).value,
//             email: (document.getElementById('email') as HTMLInputElement).value,
//             street: (document.getElementById('street') as HTMLInputElement).value,
//             city: (document.getElementById('city') as HTMLInputElement).value,
//             country: (document.getElementById('country') as HTMLInputElement).value,
//             postalCode: (document.getElementById('postalCode') as HTMLInputElement).value,
//         }

//         this.authService.updateUserSettings(this.userId, updatedUserInfo).subscribe({
//             next: (response) => {
                
//             },
//             error: (error) => {
//                 console.error('Error updating user info:', error);
//             }
//         })

//         this.formDisabled = true;
//         this.editing = false;
//         window.location.reload();
//     }
// }


import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/models/user';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  public formDisabled = true;
  public editing = false;
  public userId = '';
  public settingsForm: FormGroup;
  public successMessage: string = '';
  private originalUserData: User | null = null; 
  private editSnapshot: any = null; 

  constructor(
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      street: [''],
      city: [''],
      country: [''],
      postalCode: [''],
    });

    this.authService.user.subscribe((user) => {
      if (user) {
        this.originalUserData = user;
        this.userId = user._id;
        this.populateForm(user);
      }
    });
  }

  private populateForm(user: User): void {
    this.settingsForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      street: user.address?.street || '',
      city: user.address?.city || '',
      country: user.address?.country || '',
      postalCode: user.address?.postalCode || '',
    });
  }

  enableForm(): void {
    this.formDisabled = false;
    this.editing = true;

    this.editSnapshot = { ...this.settingsForm.value };
    this.changeDetectorRef.detectChanges();
  }

  cancelEdit(): void {
    if (this.editSnapshot) {
      this.settingsForm.patchValue(this.editSnapshot); 
    }
    this.formDisabled = true;
    this.editing = false;
    this.changeDetectorRef.detectChanges();
  }

  
}
