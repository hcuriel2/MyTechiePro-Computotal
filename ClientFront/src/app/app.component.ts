import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { User } from './shared/models/user';
import { MatSnackBar } from '@angular/material/snack-bar';
import { first } from 'rxjs/operators';
import { AuthService } from './shared/services/auth.service';
import { SignInComponent } from './modules/sign-in/sign-in.component';
import { Options } from 'ngx-google-places-autocomplete/objects/options/options';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
    public user: User | null | undefined;
    userAddress: string = ''
    userLatitude: string = ''
    userLongitude: string = ''

    constructor(
        private dialog: MatDialog,
        private router: Router,
        private snackbar: MatSnackBar,
        private authService: AuthService,
        private changeDetectorRef: ChangeDetectorRef,
        private translateService: TranslateService
    ) {
        translateService.setDefaultLang('en-us');
        translateService.use('en-us');

        this.authService.user.subscribe(
            (u: any) =>
                (this.user =
                    u === null || Object.keys(u).length === 0 ? null : u)
        );
    }
    title = 'computer-guy-frontend';

    public ngOnDestroy(): void {
        console.log('ngOnDestroy');
    }

    public ngOnInit(): void {

        let userCookie = localStorage.getItem("user");

    if (!userCookie) {
        this.authService.signOut();
    }
        // Checks the usertype so that clients and techies cannot go to unnecessary pages.
        if (localStorage.getItem("user")) {
            document.getElementById("app-menu-signup-btn")!.style.display  = "none";
            document.getElementById("app-menu-join-btn")!.style.display  = "none";
            document.getElementById("app-menu-project-btn")!.style.display  = "block";
            document.getElementById("app-menu-user-info")!.style.display = "block";
            if(JSON.parse(localStorage.getItem("user")!).userType == "Professional") {
                document.getElementById('app-toolbar')!.style.backgroundColor = "#ef0078";
                document.getElementById('footer')!.style.background = "#ef0078";
            }
        }
        console.log('ngOnInit');
    }

    /**
     * Assigns the user's latitude, longitude, and formatted address.
     * @param address 
     */
    handleAddressChange(address: any) {
        this.userAddress = address.formatted_address
        this.userLatitude = address.geometry.location.lat()
        this.userLongitude = address.geometry.location.lng()
    }

    public onClick(): void {
        console.log('something');
    }

    // Opens sign-in dialog, logs user in if information is valid, logs an error if information is invalid
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
                    console.log('sign-in failed');
                }
            });
    }

    // Signs out the user and redirects to homepage
    public signOut(): void {
        const keys = ['Message.LoggedOut', 'Dictionary.OK'];
        let cookie = getCookie("user");
        document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        this.translateService
            .get(keys)
            .pipe(first())
            .subscribe((translations) => {
                this.snackbar.open(
                    translations[keys[0]],
                    translations[keys[1]]
                );
            });

        this.authService.signOut();

        this.router.navigateByUrl('/')
            .then(() => {
                window.location.reload();
            });
    }

    public routeToHomePage(): void {
        this.router.navigateByUrl('/');
    }

    /**
     * Navigates to the URL based on the user type stored inside of localstorage.
     */
    public routeBasedOnUser() : void {
        if(localStorage.getItem("user") == null) {
            this.router.navigateByUrl('/')
                .then(() => {
                    //window.location.reload();
                });
        } else if(JSON.parse(localStorage.getItem("user")!).userType == "Professional") {
            this.router.navigateByUrl('/projects')
                .then(() => {
                    //window.location.reload();
                });
        } else {
            this.router.navigateByUrl('/')
                .then(() => {
                    //window.location.reload();
                });
        }
    }

    // Redirect to about page
    public routeToAboutPage(): void {
        this.router.navigateByUrl('/about');
    }

    // Redirect to contact page
    public routeToContactUsPage(): void {
        this.router.navigateByUrl('/contact-us');
    }

    // Redirect to project list page
    public renderProjectsList(): void {
        this.router.navigate(['/projects']);
    }

    // Redirect to sign up page
    public signUp(): void {
        this.router
            .navigate(['/sign-up'], {
                queryParams: {
                    forPro: false,
                },
            })
            .then(() => {
                window.location.reload();
            });
    }
    // Redirect to sign up page for technichian
    public joinPro(): void {
        this.router
            .navigate(['/sign-up'], {
                queryParams: {
                    forPro: true,
                },
            })
            .then(() => {
                window.location.reload();
            });
    }

    public settings(): void {
        this.router.navigateByUrl('/settings');
    }
}

function getCookie(cname: string) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }