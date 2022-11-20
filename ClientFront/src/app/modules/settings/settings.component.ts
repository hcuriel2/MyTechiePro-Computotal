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
            console.error("err user not loaded");
            return;
        }
    }

    public setupMfa(): void {
        this.mfaRequested = true;
        this.authService.setupMFA(this.user._id, this.user.email).subscribe((mfa) => {
            console.log(mfa);
            this.mfa = mfa;
            this.changeDetectorRef.detectChanges();
        })
    }

    public verify(): void {
        this.authService.verifyMFA(this.user._id, this.token).subscribe(
            res => console.log(res),
            err => {
                if (err.status == 200) {
                    this.authService.signOut();
                    this.router.navigateByUrl('/')
                        .then(() => {
                            window.location.reload();
                        });
                    alert("Sucessfully added 2-Factor Authentication. You will now be logged out.");
                } else {
                    alert("Authentication failed.");
                }
            }
        )
    }

    public resetMFA(): void {
        this.authService.resetMFA(this.user._id).subscribe(
            res => {
                console.log(res);
            },
            err => {
                if (err.status == 200) {
                    this.authService.signOut();
                    this.router.navigateByUrl('/')
                        .then(() => {
                            window.location.reload();
                        });
                    alert("Sucessfully reset 2-Factor Authentication. You will now be logged out.");
                }
            }
        );
    }
}
