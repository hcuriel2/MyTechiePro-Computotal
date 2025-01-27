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
import { passwordValidator } from "./password.directive";
import { Category } from "src/app/shared/models/category";
import { CategoryService } from "src/app/shared/services/category.service";
import { Options } from "ngx-google-places-autocomplete/objects/options/options";

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent implements OnInit, OnDestroy {
  public formGroup: FormGroup;
  public firstName: FormControl;
  public lastName: FormControl;
  public emailAddress: FormControl;
  public phoneNumber: FormControl;
  public password: FormControl;
  public confirmPassword: FormControl;
  public companyName: FormControl;
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
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService
  ) {
    this.destroyed = new Subject<void>();
    this.forPro = this.route.snapshot.queryParams.forPro === "true";
  }

  public ngOnInit(): void {
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

  // User information is saved to the backend, such as location, first and last name etc.
  public onSubmit(): void {
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
          

          this.authService.setUserValue(user);
          this.changeDetectorRef.detectChanges();


          this.translateService
            .get("Message.SignUpSuccess")
            .pipe(first())
            .subscribe((translation) => {
              const config = new MatSnackBarConfig();
              config.duration = Constants.ShortDuration;

              this.snackBar.open(translation, "", config);
            });


            if (user.userType === 'Professional'){
              this.router.navigateByUrl('/projects').then(() => {
                window.location.reload();
              })
            } else {
              this.router.navigateByUrl('/').then(() => {
                window.location.reload();
              })
            }
          //add cookie to browser for user.
         // let userLocalStorage = JSON.stringify(localStorage.getItem("user"));
        //  let cookieName =
         //   "user=" + userLocalStorage + ";" + "domain=mytechie.pro;";
         // document.cookie = cookieName;
         // 
         // 

          //Send signed up user to correct page (projects if "techie" user, "home" if client)
          /*if (
            JSON.parse(localStorage.getItem("user")!).userType == "Professional"
          ) {
            this.router.navigateByUrl("/projects").then(() => {
              window.location.reload();
            });
          } else {
            this.router.navigateByUrl("/").then(() => {
              window.location.reload();
            });
          }*/
        },
        (error) => {
          console.error("User signup failed", error);

          let errorMessage = 'Message.SignUpFailure';
          if (error.error && typeof error.error === 'string') {
            if (error.error.includes('email')) {
              errorMessage = 'Message.emailAlreadyExists';
            } else if (error.error.includes('address')) {
              errorMessage = 'Message.addressInvalid';
            }
          }

          this.translateService
            .get(errorMessage)
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
    this.city = new FormControl(null);
    this.country = new FormControl(null);
    this.street = new FormControl(null);
    this.postalCode = new FormControl(null);

    this.formGroup = this.formBuilder.group({
      firstName: this.firstName,
      lastName: this.lastName,
      emailAddress: this.emailAddress,
      password: this.password,
      confirmPassword: this.confirmPassword,
      phoneNumber: this.phoneNumber,
      companyName: this.companyName,
      city: this.city,
      country: this.country,
      street: this.street,
      postalCode: this.postalCode,
    });

    if (this.forPro) {
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
