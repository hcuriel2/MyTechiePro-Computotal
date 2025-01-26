import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { User } from "src/app/shared/models/user";
import { AuthService } from "src/app/shared/services/auth.service";
import { first, map } from "rxjs/operators";
import { plainToClass } from "class-transformer";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.scss"],
})
export class SignInComponent implements OnInit {
  public emailAddress!: FormControl;
  public password!: FormControl;
  public formGroup!: FormGroup;
  public authCode: FormControl;
  public isResetPw: boolean;
  public isResetEmailSend: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private dialogRef: MatDialogRef<SignInComponent>
  ) { }

  public ngOnInit(): void {
    this.emailAddress = new FormControl(null, Validators.required);
    this.password = new FormControl(null, Validators.required);
    this.authCode = new FormControl(null);
    this.isResetPw = false;
    this.isResetEmailSend = false;

    this.formGroup = this.formBuilder.group({
      emailAddress: this.emailAddress,
      password: this.password,
      authCode: this.authCode,
    });
  }

  public close(): void {
    this.dialogRef.close();
  }

  public sendEmail(): void {
    this.isResetEmailSend = true;
    this.authService
      .sendEmailResetPw(this.emailAddress.value)
      .pipe()
      .subscribe(
        () => {
          this.isResetEmailSend = true;
        },
        (error) => {
          console.error("Email failed to send", error);
        }
      );
  }

  public toggleSignInForgotPw(): void {
    this.isResetPw = !this.isResetPw;
    this.isResetEmailSend = false;
  }

  //Redirects to signup page
  public createAccount(): void {
    this.router.navigateByUrl("/sign-up");
    this.dialogRef.close(null);
  }

  public signIn(): void {
    const user: User = new User();
    user.email = this.emailAddress.value;
    user.password = this.password.value;
    user.secret = this.authCode?.value;

    /**
     * if signin success -> user data will be returned to app.component.ts
     * 
     * Retrieves the 'user' item from localstorage and checks the usertype to correctly
     * navigate to the corresponding URL.
     */
    this.authService.signIn(user).subscribe(
      (user: User) => {

        if (!user) return;

        if (user.userType == 'Professional') {
          this.dialogRef.close(user);
          this.router.navigateByUrl('/projects').then(() => {
            //window.location.reload()
          })
        } else if (user.userType == 'Client') {
          this.dialogRef.close(user);
          this.router.navigateByUrl('/').then(() => {
          })
        } else {
          window.location.href = environment.adminUrl;
        }
      },
      (error) => {
        if (error.status == 401 && !this.authCode.value) {
          // failed due to bad auth
          document.getElementById("authCode")!.style.display = "block";
        } else {
          console.error(`Error in SignIn.signIn(): ${error}`, error);
          document.getElementById("failedLogin")!.style.display = "block";
        }
      }
    );
  }
}
