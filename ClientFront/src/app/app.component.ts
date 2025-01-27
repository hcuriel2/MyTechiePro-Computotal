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
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  public user: User | null | undefined;
  userAddress: string = "";
  userLatitude: string = "";
  userLongitude: string = "";
  isProfessional: boolean = false;
  isMenuOpen: boolean = false;

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

  public ngOnDestroy(): void {}

  public ngOnInit(): void {
    if (!this.authService.isSessionChecked) {
      this.authService.checkSession().subscribe({
        next: (user) => {
          this.user = user;
        },
      });
    }

    this.authService.user.subscribe((user) => {
      if (user) {
        this.isProfessional = user.userType === "Professional";
        this.updateUIBasedOnUser(user);
      } else {
        this.isProfessional = false;
      }
    });
  }

  private updateUIBasedOnUser(user: User | null): void {
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

  public onClick(): void {}

  public signIn(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    this.dialog
      .open(SignInComponent, dialogConfig)
      .afterClosed()
      .subscribe((user: User) => {
        if (user != null) {
        } else {
        }
      });
  }

  public signOut(): void {
    this.authService.signOut().subscribe({
      next: () => {
        this.authService.setUserValue(null);
      },
    });
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
    if (this.user?.userType === "Professional") {
      this.router.navigateByUrl("/projects");
    } else {
      this.router.navigateByUrl("/");
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
    const currentUrl = this.router.url;
    const isOnSignUpPage = currentUrl.includes('sign-up');
    const urlParams = new URLSearchParams(window.location.search);
    const isProSignup = urlParams.get('forPro') === 'true';
    
    if (!isOnSignUpPage || isProSignup) {
      window.location.href = '/sign-up?forPro=false';
    } else {
      window.location.reload();
    }
  }

  // Redirect to sign up page for professional
  public joinPro(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const isProSignup = urlParams.get('forPro') === 'true';
    
    if (!isProSignup) {
      window.location.href = '/sign-up?forPro=true';
    } else {
      window.location.reload();
    }
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
