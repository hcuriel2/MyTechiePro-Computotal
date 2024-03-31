import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { User } from "./shared/models/user";
import { MatSnackBar } from "@angular/material/snack-bar";
import { first } from "rxjs/operators";
import { AuthService } from "./shared/services/auth.service";
import { SignInComponent } from "./modules/sign-in/sign-in.component";
import { Options } from "ngx-google-places-autocomplete/objects/options/options";
import { Message } from "./shared/models/message";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  public user: User | null | undefined;
  userAddress: string = "";
  userLatitude: string = "";
  userLongitude: string = "";
  isProfessional: boolean = false;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService
  ) {
    translateService.setDefaultLang("en-us");
    translateService.use("en-us");

    this.authService.user.subscribe(
      (u: any) =>
        (this.user = u === null || Object.keys(u).length === 0 ? null : u)
    );
  }
  title = "computer-guy-frontend";

  public ngOnDestroy(): void {
    console.log("ngOnDestroy");
  }

  // Initialize the component
  public ngOnInit(): void {

    // Subscribe to the user observable (within AuthService)
    this.authService.user.subscribe((user) => {
      this.user = user;
      this.changeDetectorRef.detectChanges();
      this.isProfessional = user?.userType === "Professional" ?? false;

      // Checks the userType to adjust UI elements accordingly
      const signupBtn = document.getElementById("app-menu-signup-btn");
      const joinBtn = document.getElementById("app-menu-join-btn");
      const projectBtn = document.getElementById("app-menu-project-btn");
      const userInfo = document.getElementById("app-menu-user-info");
      const toolbar = document.getElementById("app-toolbar");
      const footer = document.getElementById("footer");
  
      if (signupBtn) {
        signupBtn.style.display = "none";
      }
      if (joinBtn) {
        joinBtn.style.display = "none";
      }
      if (projectBtn) {
        projectBtn.style.display = "block";
      }
      if (userInfo) {
        userInfo.style.display = "block";
      }
      if (toolbar && footer) {
        if (this.user?.userType === "Professional") {
          toolbar.style.backgroundColor = "#ef0078";
          footer.style.background = "#ef0078";
        }
      }


      this.changeDetectorRef.detectChanges();
    });
  }
  
  /**
   * Assigns the user's latitude, longitude, and formatted address.
   * @param address
   */
  handleAddressChange(address: any) {
    this.userAddress = address.formatted_address;
    this.userLatitude = address.geometry.location.lat();
    this.userLongitude = address.geometry.location.lng();
  }

  public onClick(): void {
    console.log("something");
  }

  // Signs out the user and redirects to homepage
  public signOut(): void {
    const keys = ["Message.LoggedOut", "Dictionary.OK"];
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    this.translateService
      .get(keys)
      .pipe(first())
      .subscribe((translations) => {
        this.snackbar.open(translations[keys[0]], translations[keys[1]]);
      });

  dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;

  this.dialog
    .open(SignInComponent, dialogConfig)
    .afterClosed()
    .subscribe((user: User) => {
      if (user != null) {
      } else {
        console.log("sign-in failed");
      }
    });
}


public signOut(): void {
  const keys = ["Message.LoggedOut", "Dictionary.OK"];
  document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  this.translateService
    .get(keys)
    .pipe(first())
    .subscribe((translations) => {
      this.snackbar.open(translations[keys[0]], translations[keys[1]]);
    });

  this.authService.signOut();

  this.router.navigateByUrl("/").then(() => {
    window.location.reload();
  });
}

  // Navigates to the Home page
  public routeToHomePage(): void {
    this.router.navigateByUrl("/");
  }


   // Handles page routing
  // Dependent on the userType value of the current User
  public routeBasedOnUser(): void {
    console.log('i got you now')
    if (this.user?.userType === 'Professional'){
      this.router.navigateByUrl('/projects');
    } else {
      this.router.navigateByUrl('/');
    }
  }

  // Redirect to about page
  public routeToAboutPage(): void {
    this.router.navigateByUrl("/about");
  }

  // Redirect to contact page
  public routeToContactUsPage(): void {
    this.router.navigateByUrl("/contact-us");
  }

  // Redirect to project list page
  public renderProjectsList(): void {
    this.router.navigate(["/projects"]);
  }

  // Redirect to sign up page
  public signUp(): void {
    this.router
      .navigate(["/sign-up"], {
        queryParams: {
          forPro: false,
        },
      })
      .then(() => {
        window.location.reload();
      });
  }
  // Redirect to sign up page for professional
  public joinPro(): void {
    this.router
      .navigate(["/sign-up"], {
        queryParams: {
          forPro: true,
        },
      })
      .then(() => {
        window.location.reload();
      });
  }

  // Navigates to the User's settings page
  public settings(): void {
    this.router.navigateByUrl("/settings");
  }

  // Navigates to Professional's profile
  public navigateToProProfile(): void {
    this.router.navigateByUrl("/pro-profile");
  }

}
