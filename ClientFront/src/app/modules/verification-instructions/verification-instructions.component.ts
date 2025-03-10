import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/shared/services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-verification-instructions",
  templateUrl: "./verification-instructions.component.html",
  styleUrls: ["./verification-instructions.component.scss"],
})
export class VerificationInstructionsComponent implements OnInit {
  userEmail: string = "";
  isResending: boolean = false;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    // Try to get the email from route params or local storage
    this.route.queryParams.subscribe((params) => {
      if (params["email"]) {
        this.userEmail = params["email"];
      } else {
        // Fallback method if no email in params
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            const user = JSON.parse(userData);
            this.userEmail = user.email || "";
          } catch (e) {
            console.error("Error parsing user data", e);
          }
        }
      }
    });
  }

  resendVerificationEmail(): void {
    if (!this.userEmail) {
      this.translateService
        .get("Message.EmailAddressRequired")
        .subscribe((translation) => {
          this.snackBar.open(translation, "", { duration: 5000 });
        });
      return;
    }

    this.isResending = true;

    this.authService.resendVerificationEmail(this.userEmail).subscribe(
      (response) => {
        this.isResending = false;
        this.translateService
          .get("Message.VerificationEmailResent")
          .subscribe((translation) => {
            this.snackBar.open(translation, "", { duration: 5000 });
          });
      },
      (error) => {
        this.isResending = false;
        console.error("Error resending verification email:", error);
        this.translateService
          .get("Message.ErrorResendingVerificationEmail")
          .subscribe((translation) => {
            this.snackBar.open(translation, "", { duration: 5000 });
          });
      }
    );
  }
}
