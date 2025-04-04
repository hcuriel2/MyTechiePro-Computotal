import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "src/app/shared/services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpResponseBase } from "@angular/common/http";

@Component({
  selector: "app-verify-email",
  templateUrl: "./verify-email.component.html",
  styleUrls: ["./verify-email.component.scss"],
})
export class VerifyEmailComponent implements OnInit {
  isLoading = true;
  isTokenValid = false;
  isVerified = false;
  error: string | null = null;
  userEmail: string | null = null;
  token: string | null = null;
  session: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.session = params['session'];
      
      if (this.token && this.session) {
        this.checkVerification();
      } else {
        this.isLoading = false;
        this.error = 'Invalid verification link. Missing token or session.';
      }
    });
  }

  // First step: Check verification status
  checkVerification(): void {
    this.authService.checkVerification(this.token!, this.session!)
      .subscribe(
        response => {
          this.isLoading = false;
          this.isTokenValid = true;
          this.isVerified = response.isVerified;
          this.userEmail = response.email;
        },
        error => {
          this.isLoading = false;
          this.error = error.error?.message || 'Verification failed';
          console.error("Verification check error:", error);
        }
      );
  }

  // Second step: Confirm verification
  confirmVerification(): void {
    this.isLoading = true;
    
    this.authService.confirmVerification(this.token!, this.session!)
      .subscribe(
        response => {
          this.isLoading = false;
          this.isVerified = true;
          
          // If user info is returned, update the auth service
          if (response.user) {
            this.authService.setUserValue(response.user);
          }
          
          // Display success message
          this.snackBar.open('Email verified successfully', 'Close', {
            duration: 5000,
          });
          
          // Redirect to home page after a delay
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        },
        error => {
          this.isLoading = false;
          this.error = error.error?.message || 'Verification failed';
          console.error("Verification confirmation error:", error);
        }
      );
  }
}
