import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/models/user';
import { HttpClient } from '@angular/common/http';
// import { environment } from 'src/environments/environment';

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
  // MFA screen state: `enrolling` shows the pending QR flow; `replacing` keeps the
  // copy accurate during a reset. The server continues accepting the old key until
  // the replacement is confirmed.
  public mfaEnabled = false;
  public enrolling = false;
  public replacing = false;
  public mfaBusy = false;
  public qrDataUrl = '';
  public manualSecret = '';
  public confirmCode = '';
  public mfaMessage = '';
  public mfaError = '';
  private messages: any = {};
  private originalUserData: User | null = null;
  private editSnapshot: any = null;
  // public stripeConnected: boolean = false;
  // public stripeAccountId: string = '';
  // public isProfessional: boolean = false;

  constructor(
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    private http: HttpClient
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

    this.authService.user.subscribe((user) => {
      if (user) {
        this.mfaEnabled = !!user.mfaEnabled;
        this.userId = user._id;
        // Don't refill the profile form while they're mid-edit. Confirming MFA
        // updates the user and would otherwise wipe what they typed.
        if (!this.editing) {
          this.originalUserData = user;
          this.populateForm(user);
        }
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

  // connectStripe(): void {
  //   if(!this.originalUserData) {
  //     this.errorMessage = 'Please sign in first';
  //     return;
  //   }
  //   window.location.href = `${environment.apiEndpoint}/stripe/connect`
  // }

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

  // First-time setup and reset share the same endpoint. The API stores a pending key
  // and returns its QR/manual form; neither action enables MFA by itself.
  startMfaSetup(replacing: boolean): void {
    this.mfaBusy = true;
    this.mfaError = '';
    this.mfaMessage = '';
    this.replacing = replacing;
    this.authService.setupMfa().subscribe({
      next: (setup) => {
        this.qrDataUrl = setup.qrDataUrl;
        this.manualSecret = setup.secret;
        this.confirmCode = '';
        this.enrolling = true;
        this.mfaBusy = false;
      },
      error: (error) => {
        this.mfaBusy = false;
        this.mfaError = this.readMfaError(error, 'Could not start authenticator setup.');
      },
    });
  }

  // Hide and clear the enrollment UI. The server-side pending key is not active, so
  // cancelling here leaves the current sign-in behavior unchanged.
  cancelMfaSetup(): void {
    this.enrolling = false;
    this.qrDataUrl = '';
    this.manualSecret = '';
    this.confirmCode = '';
    this.mfaError = '';
  }

  // Confirm the pending key with a current 6-digit code. Only a successful response
  // switches this view to the enabled state and updates the shared user session model.
  confirmMfaSetup(): void {
    const token = (this.confirmCode || '').replace(/\s/g, '');
    if (!/^\d{6}$/.test(token)) {
      this.mfaError = 'Enter the 6-digit code from your authenticator app.';
      return;
    }
    this.mfaBusy = true;
    this.mfaError = '';
    this.authService.confirmMfa(token).subscribe({
      next: () => {
        this.mfaEnabled = true;
        this.enrolling = false;
        this.qrDataUrl = '';
        this.manualSecret = '';
        this.confirmCode = '';
        this.mfaBusy = false;
        this.mfaMessage = 'Authenticator is on for this account.';
      },
      error: (error) => {
        this.mfaBusy = false;
        this.mfaError = this.readMfaError(error, 'That code was not accepted.');
      },
    });
  }

  disableMfa(): void {
    this.mfaBusy = true;
    this.mfaError = '';
    this.mfaMessage = '';
    this.authService.disableMfa().subscribe({
      next: () => {
        this.mfaEnabled = false;
        this.mfaBusy = false;
        this.mfaMessage = 'Authenticator is off. Sign-in uses your password only.';
      },
      error: (error) => {
        this.mfaBusy = false;
        this.mfaError = this.readMfaError(error, 'Could not turn off the authenticator.');
      },
    });
  }

  // Use the server's message when it sent one (bad code, wrong password, and so on).
  private readMfaError(error: any, fallback: string): string {
    if (error && error.error && error.error.message) {
      return error.error.message;
    }
    return fallback;
  }
}
