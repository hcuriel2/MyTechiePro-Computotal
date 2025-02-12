import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/models/user';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/shared/services/user.service'; 

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  public formDisabled = true;
  public editing = false;
  public userId = '';
  public settingsForm: FormGroup;
  public successMessage: string = '';
  public errorMessage: string = '';
  private messages: any = {};
  private originalUserData: User | null = null;
  private editSnapshot: any = null;
  public stripeConnected: boolean = false;
  public stripeAccountId: string = '';
  public isProfessional: boolean = false;

  constructor(
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.http.get('/assets/i18n/en-us.json').subscribe((data) => {
      this.messages = data;
    });

    this.settingsForm = this.fb.group({
      firstName: [{ value: '', disabled: true }, Validators.required],
      lastName: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      street: [{ value: '', disabled: true }],
      city: [{ value: '', disabled: true }],
      country: [{ value: '', disabled: true }],
      postalCode: [{ value: '', disabled: true }],
    });

    /**
     * Listen for URL query parameters after Stripe onboarding redirect
     * Checks for userId and accountId from Stripe callback
     */
    this.route.queryParams.subscribe(params => {
      const userId = params['userId'];
      const accountId = params['accountId'];

      if (userId && accountId) {
        this.updateStripeAccount(userId, accountId);
      } else {
        this.loadUserData();
      }
    });
  }
  /**
   * Loads user data and sets up Stripe-related flags
   * Called on component initialization and after profile updates
   */
  private loadUserData(): void {
    this.authService.user.subscribe((user) => {
      if (user) {
        this.originalUserData = user;
        this.userId = user._id;
        this.isProfessional = user.userType === 'Professional';
        this.stripeConnected = !!user.stripeAccountId;
        this.stripeAccountId = user.stripeAccountId || '';
        this.populateForm(user);
      }
    });
  }

  /**
   * Updates user's Stripe account ID in database
   * Called after successful Stripe onboarding
   * @param userId - User's ID in our system
   * @param accountId - Stripe Connect account ID
   */
  private updateStripeAccount(userId: string, accountId: string): void {
    this.userService.setStripeAccountId(userId, accountId)
        .subscribe({
            next: (user) => {
                console.log("Stripe account linked successfully");
                this.successMessage = "Stripe account linked successfully!";
                this.stripeAccountId = user.stripeAccountId || '';
                this.stripeConnected = true;
                this.router.navigate(['/settings']);
            },
            error: (err) => {
                console.error("Error updating Stripe account:", err);
                this.errorMessage = "Failed to update Stripe account. Please try again.";
            }
        });
  }

  private populateForm(user: User): void {
    this.settingsForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      street: user.address?.street || '',
      city: user.address?.city || '',
      country: user.address?.country || '',
      postalCode: user.address?.postalCode || '',
    });
  }

  enableForm(): void {
    this.formDisabled = false;
    this.editing = true;

    Object.keys(this.settingsForm.controls).forEach((key) => {
      this.settingsForm.get(key)?.enable();
    });

    this.editSnapshot = { ...this.settingsForm.value };
    this.changeDetectorRef.detectChanges();
  }

  cancelEdit(): void {
    if (this.editSnapshot) {
      this.settingsForm.patchValue(this.editSnapshot);
    }
    this.formDisabled = true;
    this.editing = false;

    Object.keys(this.settingsForm.controls).forEach((key) => {
      this.settingsForm.get(key)?.disable();
    });

    this.changeDetectorRef.detectChanges();
  }

  /**
   * Initiates Stripe Connect onboarding process
   * Creates Stripe account and redirects to Stripe onboarding
   */
  connectStripe(): void {
    if (!this.originalUserData) {
      this.errorMessage = 'Please sign in first';
      return;
    }
    const userId = this.originalUserData._id;
    const email = this.originalUserData.email;
    // Call backend to create Stripe Connect account
    this.http.post<{ accountLink: string }>(
      `${environment.apiEndpoint}/stripe/connect-account`,
      { email, userId }
    ).subscribe({
      next: (response) => {
        console.log("Redirecting to Stripe Onboarding:", response.accountLink);
        window.location.href = response.accountLink; 
      },
      error: (err) => {
        console.error("Error creating Stripe account:", err);
        this.errorMessage = "Failed to connect to Stripe. Please try again.";
        setTimeout(() => { this.errorMessage = ''; }, 3000);
      }
    });
  }

  submitForm(): void {
    if (this.settingsForm.valid) {
      const updatedUserInfo = this.settingsForm.value;

      this.authService.updateUserSettings(this.userId, updatedUserInfo).subscribe({
        next: () => {
          this.originalUserData = { ...this.originalUserData, ...updatedUserInfo };
          this.formDisabled = true;
          this.editing = false;

          Object.keys(this.settingsForm.controls).forEach((key) => {
            this.settingsForm.get(key)?.disable();
          });

          if (this.messages?.Message?.ProfileSaveSuccess) {
            this.successMessage = this.messages.Message.ProfileSaveSuccess;
          }

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: () => {
          if (this.messages?.Message?.ProfileSaveError) {
            this.errorMessage = this.messages.Message.ProfileSaveError;
          }

          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        },
      });
    } else {
      if (this.messages?.Message?.FormInvalid) {
        this.errorMessage = this.messages.Message.FormInvalid;
      }

      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
    }
  }
}