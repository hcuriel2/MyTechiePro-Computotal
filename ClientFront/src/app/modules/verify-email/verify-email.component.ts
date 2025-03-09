import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "src/app/shared/services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-verify-email",
  templateUrl: "./verify-email.component.html",
  styleUrls: ["./verify-email.component.scss"],
})
export class VerifyEmailComponent implements OnInit {
  verifying = true;
  verificationSuccess = false;
  errorMessage = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.params["token"];

    if (!token) {
      this.verifying = false;
      this.errorMessage = "Invalid verification token.";
      return;
    }

    this.authService.verifyEmail(token).subscribe(
      () => {
        this.verifying = false;
        this.verificationSuccess = true;

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          this.router.navigateByUrl("/");
        }, 3000);
      },
      (error) => {
        this.verifying = false;
        this.errorMessage =
          "Email verification failed. The link may be invalid.";
        console.error("Verification error:", error);
      }
    );
  }
}
