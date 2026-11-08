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
  // True only after the password was accepted and this account has an authenticator.
  public mfaStep = false;
  public mfaError = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private dialogRef: MatDialogRef<SignInComponent>
  ) {}

  public ngOnInit(): void {
    this.emailAddress = new FormControl(null, Validators.required);
    this.password = new FormControl(null, Validators.required);
    // Left optional on purpose. Password-only accounts never have to fill this in.
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
    this.mfaError = false;
    const user: User = new User();
    user.email = this.emailAddress.value;
    user.password = this.password.value;
    // Only attach a code once the extra box is open. A normal login stays email + password.
    if (this.mfaStep && this.authCode.value) {
      user.secret = String(this.authCode.value).replace(/\s/g, "");
    }

    // Password-only accounts come back as a user and follow the old redirect.
    // Authenticator accounts come back first as { mfaRequired: true }, with no cookie.
    this.authService.signIn(user).subscribe(
      (result: any) => {
        if (!result) return;

        if (result.mfaRequired) {
          this.mfaStep = true;
          // Now the code is required, and it has to be exactly 6 digits.
          this.authCode.setValidators([
            Validators.required,
            Validators.pattern(/^\d{6}$/),
          ]);
          this.authCode.updateValueAndValidity();
          document.getElementById("failedLogin")!.style.display = "none";
          document.getElementById("notVerified")!.style.display = "none";
          // Wait for the slide-out, then put the cursor in the code box.
          setTimeout(() => {
            const input = document.getElementById("mfaCodeInput");
            if (input) {
              input.focus();
            }
          }, 280);
          return;
        }

        const signedInUser: User = result;
        if (signedInUser.userType == "Professional") {
          this.dialogRef.close(signedInUser);
          this.router.navigateByUrl("/projects").then(() => {
            //window.location.reload()
          });
        } else if (signedInUser.userType == "Client") {
          this.dialogRef.close(signedInUser);
          this.router.navigateByUrl("/").then(() => {});
        } else {
          window.location.href = environment.adminUrl;
        }
      },
      (error) => {
        if (error.status == 403) {
          document.getElementById("notVerified")!.style.display = "block";
          document.getElementById("failedLogin")!.style.display = "none";
        } else if (this.mfaStep && error.status == 401) {
          // Code was wrong. Leave the extra box open so they can try the next one.
          this.mfaError = true;
          document.getElementById("failedLogin")!.style.display = "none";
          document.getElementById("notVerified")!.style.display = "none";
        } else {
          console.error(`Error in SignIn.signIn(): ${error}`, error);
          // Bad password (or anything else). Fold the code box back up so a normal
          // failed login looks the same as it did before MFA existed.
          this.mfaStep = false;
          this.mfaError = false;
          this.authCode.clearValidators();
          this.authCode.setValue(null);
          this.authCode.updateValueAndValidity();
          document.getElementById("failedLogin")!.style.display = "block";
          document.getElementById("notVerified")!.style.display = "none";
        }
      }
    );
  }

  public resendVerificationEmail(): void {
    if (this.emailAddress.valid) {
      this.authService
        .resendVerificationEmail(this.emailAddress.value)
        .pipe()
        .subscribe(
          () => {
            const message =
              "Verification email has been resent. Please check your inbox.";
            alert(message); // Or use a snackbar for better UX
          },
          (error) => {
            console.error("Failed to resend verification email", error);
            const message =
              "Failed to resend verification email. Please try again later.";
            alert(message);
          }
        );
    } else {
      alert("Please enter a valid email address.");
    }
  }
}
