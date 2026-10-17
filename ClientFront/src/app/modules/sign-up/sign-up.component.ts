import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { first, takeUntil } from "rxjs/operators";
import { Constants } from "src/app/shared/constants/constants";
import { UserType } from "src/app/shared/enums/user-type.enum";
import { Address } from "src/app/shared/models/address";
import { User } from "src/app/shared/models/user";
import { AuthService } from "src/app/shared/services/auth.service";
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { passwordValidator } from "./password.directive";
import { Category } from "src/app/shared/models/category";
import { CategoryService } from "src/app/shared/services/category.service";
import { Options } from "ngx-google-places-autocomplete/objects/options/options";
import { GoogleMapsService } from "src/app/shared/services/google-maps.service";

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent implements OnInit, OnDestroy {
  showForm = false;
  signupEnabled = false;
  signupNotice = 'Checking signup availability…';
  refreshAvailability(): void {
    this.http.get<any>(environment.apiEndpoint + '/signup-settings').pipe(takeUntil(this.destroyed)).subscribe(settings => {
      this.signupEnabled = this.forPro ? settings.professionalEnabled === true : settings.clientEnabled === true;
      this.signupNotice = this.signupEnabled ? '' : (this.forPro ? settings.professionalNotice : settings.clientNotice);
      this.changeDetectorRef.markForCheck();
    }, () => {
      this.signupEnabled = false;
      this.signupNotice = 'Signup availability could not be checked. Please try again later.';
      this.changeDetectorRef.markForCheck();
    });
  }
  public formGroup: FormGroup;
  public firstName: FormControl;
  public lastName: FormControl;
  public emailAddress: FormControl;
  public phoneNumber: FormControl;
  public password: FormControl;
  public confirmPassword: FormControl;
  public companyName: FormControl;
  public location: FormControl;
  public city: FormControl;
  public country: FormControl;
  public street: FormControl;
  public postalCode: FormControl;

  // for Professionals
  public skill1: FormControl;
  public skill2: FormControl;
  public skill3: FormControl;
  public bio: FormControl;
  public unitPrice: FormControl;
  public unitType: FormControl;
  public categories: Category[];
  public skills: any = {};
  public website: FormControl;

  public dba: FormControl;
  public gstNumber: FormControl;
  public pstNumber: FormControl;
  public businessNumber: FormControl;
  public dunsNumber: FormControl;

  public forPro: boolean;
  private destroyed: Subject<void>;

  userAddress: string = "";
  userLatitude: number = 0;
  userLongitude: number = 0;
  userPlaceId: string = "";

  userCountry: string = "";
  userPostal: string = "";
  userCity: string = "";

  userStreetAddress: string = "";

  options: Options = {
    bounds: undefined!,
    fields: ["ALL"],
    strictBounds: false,
    types: ["address"],
    origin: undefined!,
    componentRestrictions: undefined!,
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private googleMapsService: GoogleMapsService
  ) {
    this.destroyed = new Subject<void>();
    this.forPro = this.route.snapshot.queryParams.forPro === "true";
  }

  public ngOnInit(): void {
    this.refreshAvailability();
    // ensure the Google Maps script is loaded before showing the form
    if (!this.googleMapsService.isLoaded()) {
      this.googleMapsService
        .loadGoogleMapsScript()
        .then(() => {
          this.showForm = true;
          this.changeDetectorRef.markForCheck();
        })
        .catch((error) => {
          console.error("Error loading Google Maps script:", error);
          // Still show form even if Maps fails to load
          this.showForm = true;
          this.changeDetectorRef.markForCheck();
        });
    } else {
      this.showForm = true;
      this.changeDetectorRef.markForCheck();
    }
    this.createForm();
    if (this.forPro) {
      this.categoryService
        .getAll()
        .pipe(first())
        .subscribe(
          (categories: Category[]) => {
            this.categories = categories;

            this.changeDetectorRef.markForCheck();
            this.populateSkills();
          },
          (error) => {
            console.error(
              `Error in CarrierLaneRate.getStaticData(): ${error}`,
              error
            );
          }
        );
    }
  }

  /**
   * Populates skill form controls for skill selection.
   */
  public populateSkills(): void {
    for (var i = 0; i < this.categories.length; i++) {
      for (var j = 0; j < this.categories[i].services.length; j++) {
        this.skills[this.categories[i].services[j].name] = {
          skill: this.categories[i].services[j].name,
          isProSkill: new FormControl(null),
        };
        this.formGroup.addControl(
          this.categories[i].services[j].name,
          this.skills[this.categories[i].services[j].name]["isProSkill"]
        );
      }
    }
  }

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private professionalEmailValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const email = String(control.value || "")
      .trim()
      .toLowerCase();

    if (!email.includes("@")) {
      return null;
    }

    const domain = email.split("@").pop();

    const blockedDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "msn.com",
    ];

    if (domain && blockedDomains.includes(domain)) {
      return { personalEmailNotAllowed: true };
    }

    return null;
  }

  // User information is saved to the backend, such as location, first and last name etc.
  public onSubmit(): void {
    if (!this.signupEnabled) { return; }
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.changeDetectorRef.markForCheck();
      return;
    }

    const newUser: User = new User();
    const userAddress: Address = new Address();

    newUser.firstName = this.firstName.value;
    newUser.lastName = this.lastName.value;
    newUser.phoneNumber = this.phoneNumber.value;
    newUser.email = this.emailAddress.value;
    newUser.password = this.password.value;
    newUser.userType = this.forPro ? UserType.Professional : UserType.Client;
    userAddress.city = this.city.value;
    userAddress.country = this.country.value;
    userAddress.street = this.street.value;
    userAddress.postalCode = this.postalCode.value;
    newUser.address = userAddress;
    newUser.company = this.companyName.value;
    userAddress.lat = this.userLatitude;
    userAddress.lng = this.userLongitude;
    userAddress.placeid = this.userPlaceId;

    //User data used in address checking
    // newUser.lat = this.userLatitude
    // newUser.lng = this.userLongitude
    // newUser.placeid = this.userPlaceId

    if (this.forPro) {
      newUser.dba = this.dba.value ? this.dba.value.trim() : undefined;
      newUser.gstNumber = this.gstNumber.value ? this.gstNumber.value.trim() : undefined;
      newUser.pstNumber = this.pstNumber.value ? this.pstNumber.value.trim() : undefined;
      newUser.businessNumber = this.businessNumber.value ? this.businessNumber.value.trim() : undefined;
      newUser.dunsNumber = this.dunsNumber.value ? this.dunsNumber.value.trim() : undefined;
      newUser.skills = [];

      // Iterates through JSON to find selected skills
      Object.keys(this.skills).forEach((element) => {
        if (this.skills[element].isProSkill.value) {
          newUser.skills.push(this.skills[element].skill);
        }
      });

      newUser.bio = this.bio.value;
      newUser.unitPrice = Number(this.unitPrice.value);
      newUser.unitType = this.unitType.value;
      newUser.website = this.website.value;
    }

    this.authService
      .registerUser(newUser)
      .pipe(first())
      .subscribe(
        (user: User) => {
          this.changeDetectorRef.detectChanges();

          this.translateService
            .get("Message.SignUpVerificationNeeded")
            .pipe(first())
            .subscribe((translation) => {
              // Redirect to home page or specific verification instructions page
              this.router.navigate(['/verification-instructions'], { 
                queryParams: { email: this.emailAddress.value } 
              });
            });
        },
        // *C-06: fix for error message
        (error) => {
          console.error("User signup failed", error);
          if (error.status === 403 && error.error && error.error.code === 'SIGNUP_DISABLED') {
            this.signupEnabled = false;
            this.signupNotice = error.error.message;
            this.changeDetectorRef.markForCheck();
            return;
          }

          if (this.forPro && error.status === 400 && error.error &&
              typeof error.error.message === 'string' &&
              /DBA|GST Number|PST Number|Business Number|D-U-N-S Number/.test(error.error.message)) {
            this.snackBar.open(error.error.message, '', { duration: Constants.ShortDuration });
            return;
          }
          let messageKey = "Message.SignUpFailure";

          if (
            error.error &&
            typeof error.error === "string" &&
            error.error.includes("</html>")
          ) {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(error.error, "text/html");
            const preElement = htmlDoc.querySelector("pre");
            if (preElement && preElement.textContent) {
              const errorText = preElement.textContent.toLowerCase();
              if (errorText.includes("email") && errorText.includes("exists")) {
                messageKey = "Message.EmailExists";
              } else if (errorText.includes("invalid email")) {
                messageKey = "Message.InvalidEmail";
              } else if (errorText.includes("password")) {
                messageKey = "Message.WeakPassword";
              }
            }
          }

          this.translateService
            .get(messageKey)
            .pipe(first())
            .subscribe((translation) => {
              const config = new MatSnackBarConfig();
              config.duration = Constants.ShortDuration;
              this.snackBar.open(translation, "", config);
            });
        }
      );
  }

  // Creates the sign up form to be filled in
  private createForm(): void {
    this.firstName = new FormControl(null, Validators.required);
    this.lastName = new FormControl(null, Validators.required);
    this.emailAddress = new FormControl(null, [
      Validators.required,
      Validators.email,
      ...(this.forPro ? [this.professionalEmailValidator] : []),
    ]);
    //password validation; must be between 8-16, have 1 number, 1 uppercase, 1 lowercase, and 1 special character
    this.password = new FormControl(null, [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(16),
      Validators.pattern(
        "^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$"
      ),
    ]);
    this.confirmPassword = new FormControl(null, [
      Validators.required,
      passwordValidator,
    ]);
    this.phoneNumber = new FormControl(null);
    this.companyName = new FormControl(null);
    this.location = new FormControl(null, Validators.required);
    this.city = new FormControl(null, Validators.required);
    this.country = new FormControl(null, Validators.required);
    this.street = new FormControl(null, Validators.required);
    this.postalCode = new FormControl(null, Validators.required);

    this.formGroup = this.formBuilder.group({
      firstName: this.firstName,
      lastName: this.lastName,
      emailAddress: this.emailAddress,
      password: this.password,
      confirmPassword: this.confirmPassword,
      phoneNumber: this.phoneNumber,
      companyName: this.companyName,
      location: this.location,
      city: this.city,
      country: this.country,
      street: this.street,
      postalCode: this.postalCode,
    });

    if (this.forPro) {
      this.dba = new FormControl(null, [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]);
      this.formGroup.addControl('dba', this.dba);
      this.gstNumber = new FormControl(null, [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]);
      this.formGroup.addControl('gstNumber', this.gstNumber);
      this.pstNumber = new FormControl(null, [Validators.required, Validators.pattern(/\S/), Validators.maxLength(50)]);
      this.formGroup.addControl('pstNumber', this.pstNumber);
      this.businessNumber = new FormControl(null, [Validators.pattern(/\S/), Validators.maxLength(50)]);
      this.formGroup.addControl('businessNumber', this.businessNumber);
      this.dunsNumber = new FormControl(null, [Validators.pattern(/\S/), Validators.maxLength(50)]);
      this.formGroup.addControl('dunsNumber', this.dunsNumber);
      this.skill1 = new FormControl(null);
      this.skill2 = new FormControl(null);
      this.skill3 = new FormControl(null);
      this.bio = new FormControl(null);
      this.unitPrice = new FormControl(null);
      this.unitType = new FormControl(null);
      this.website = new FormControl(null);

      this.formGroup.addControl("skill1", this.skill1);
      this.formGroup.addControl("skill2", this.skill2);
      this.formGroup.addControl("skill3", this.skill3);
      this.formGroup.addControl("bio", this.bio);
      this.formGroup.addControl("unitPrice", this.unitPrice);
      this.formGroup.addControl("unitType", this.unitType);
      this.formGroup.addControl("website", this.website);
    }

    this.subscribeToFormChanges();

    this.changeDetectorRef.markForCheck();
  }

  private subscribeToFormChanges(): void {
    this.formGroup.valueChanges
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  /**
   * Loops through the address component and finds each required field
   * and assigns it to the corresponding userAddress.
   * @param address
   */
  handleAddressChange(address: any) {
    let addressComponents = address.address_components;

    this.userAddress = address.formatted_address;
    this.userLatitude = address.geometry.location.lat();
    this.userLongitude = address.geometry.location.lng();
    this.userPlaceId = address.place_id;

    let streetNumber;
    let streetName;

    for (let i = 0; i < addressComponents.length; i++) {
      let types = addressComponents[i].types;
      for (let j = 0; j < types.length; j++) {
        if (types[j] == "country") {
          this.userCountry = addressComponents[i].long_name;
        }
        if (types[j] == "postal_code") {
          this.userPostal = addressComponents[i].long_name;
        }
        if (types[j] == "locality") {
          this.userCity = addressComponents[i].long_name;
        }
        if (types[j] == "street_number") {
          streetNumber = addressComponents[i].long_name;
        }
        if (types[j] == "route") {
          streetName = addressComponents[i].long_name;
        }
      }
      this.userStreetAddress = streetNumber + " " + streetName;
    }

    this.country.patchValue(this.userCountry);
    this.city.patchValue(this.userCity);
    this.street.patchValue(this.userStreetAddress);
    this.postalCode.patchValue(this.userPostal);

    // this.userCountry = address.geometry.location.country()
  }

  onSkillCheckboxClicked(skillName: string): void {
    const selectedSkills = Object.keys(this.skills).filter(
      (name) => this.formGroup.get(name)?.value
    );
    if (selectedSkills.length >= 3 && !this.formGroup.get(skillName)?.value) {
      this.formGroup.get(skillName)?.setValue(false);
    }
  }

  getSelectedSkillsCount(): number {
    let count = 0;
    Object.keys(this.skills).forEach((skillName) => {
      if (this.formGroup.get(skillName)?.value) {
        count++;
      }
    });
    return count;
  }
}
