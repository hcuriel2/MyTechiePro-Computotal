import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

// Admins do not use the client profile page, so this dialog provides the same
// enrollment, reset, confirmation, and disable flow through the shared /auth/mfa API.
@Component({
  selector: 'app-mfa-settings-dialog',
  templateUrl: './mfa-settings-dialog.component.html',
  styleUrls: ['./mfa-settings-dialog.component.scss'],
})
export class MfaSettingsDialogComponent {
  public mfaEnabled: boolean;
  // enrolling = we're showing a QR that is not active yet.
  // replacing = they already had MFA, and the old code still works until they confirm.
  public enrolling = false;
  public replacing = false;
  public busy = false;
  public qrDataUrl = '';
  public manualSecret = '';
  public confirmCode = '';
  public message = '';
  public error = '';
  public currentPassword = '';
  public currentToken = '';
  // Admins use the account-security dialog rather than the customer Settings page.
  public showPasswordForm = false;
  public changeCurrentPassword = '';
  public changeNewPassword = '';
  public changeConfirmPassword = '';
  public changeToken = '';
  public passwordBusy = false;
  public passwordMessage = '';
  public passwordError = '';

  private readonly api = `${environment.apiEndpoint}/auth`;

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<MfaSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { mfaEnabled: boolean }
  ) {
    this.mfaEnabled = !!data.mfaEnabled;
  }

  // Hand the updated on/off flag back so the toolbar remembers it if they reopen this.
  public close(): void {
    this.currentPassword = ''; this.currentToken = '';
    this.dialogRef.close(this.mfaEnabled);
  }

  // First-time setup and reset both request a pending key. MFA becomes active only
  // after confirmSetup validates a code from the matching authenticator app.
  public startSetup(replacing: boolean): void {
    this.busy = true;
    this.error = '';
    this.message = '';
    this.replacing = replacing;
    this.http
      .post<any>(`${this.api}/mfa/setup`, this.proof(), { withCredentials: true })
      .subscribe({
        next: (setup) => {
          this.qrDataUrl = setup.qrDataUrl;
          this.manualSecret = setup.secret;
          this.confirmCode = '';
          this.enrolling = true;
          this.busy = false;
        },
        error: (error) => {
          this.busy = false;
          this.error = this.readError(error, 'Could not start authenticator setup.');
        },
      });
  }

  // Hide and clear the QR form. Any pending key is ignored at sign-in until confirmed.
  public cancelSetup(): void {
    this.currentPassword = ''; this.currentToken = '';
    this.enrolling = false;
    this.qrDataUrl = '';
    this.manualSecret = '';
    this.confirmCode = '';
    this.error = '';
  }

  // The 6-digit code has to match the QR on screen before MFA is really on.
  public confirmSetup(): void {
    const token = (this.confirmCode || '').replace(/\s/g, '');
    if (!/^\d{6}$/.test(token)) {
      this.error = 'Enter the 6-digit code from your authenticator app.';
      return;
    }
    this.busy = true;
    this.error = '';
    this.http
      .post<any>(`${this.api}/mfa/confirm`, { token, ...this.proof() }, { withCredentials: true })
      .subscribe({
        next: () => {
          this.mfaEnabled = true;
          this.enrolling = false;
          this.qrDataUrl = '';
          this.manualSecret = '';
          this.confirmCode = '';
          this.busy = false;
          this.message = 'Authenticator is on for this account.';
          this.currentPassword = ''; this.currentToken = '';
        },
        error: (error) => {
          this.busy = false;
          this.error = this.readError(error, 'That code was not accepted.');
        },
      });
  }

  public disable(): void {
    this.busy = true;
    this.error = '';
    this.message = '';
    this.http
      .post<any>(`${this.api}/mfa/disable`, this.proof(), { withCredentials: true })
      .subscribe({
        next: () => {
          this.mfaEnabled = false;
          this.busy = false;
          this.message = 'Authenticator is off. Sign-in uses your password only.';
          this.currentPassword = ''; this.currentToken = '';
        },
        error: (error) => {
          this.busy = false;
          this.error = this.readError(error, 'Could not turn off the authenticator.');
        },
      });
  }

  public changePassword(): void {
    this.passwordError = '';
    this.passwordMessage = '';
    if (!this.changeCurrentPassword ||
      this.changeNewPassword.length < 8 || this.changeNewPassword.length > 16 ||
      !/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$/.test(this.changeNewPassword)) {
      this.passwordError = 'Use 8–16 characters with uppercase, lowercase, number and special character.';
      return;
    }
    if (this.changeNewPassword !== this.changeConfirmPassword) {
      this.passwordError = 'New passwords do not match.';
      return;
    }
    if (this.mfaEnabled && !/^\d{6}$/.test(this.changeToken.trim())) {
      this.passwordError = 'Enter the current 6-digit authenticator code.';
      return;
    }
    this.passwordBusy = true;
    const body: any = {
      currentPassword: this.changeCurrentPassword,
      newPassword: this.changeNewPassword,
      confirmNewPassword: this.changeConfirmPassword,
    };
    if (this.mfaEnabled) body.currentToken = this.changeToken.trim();
    this.http.post<any>(`${this.api}/change-password`, body, { withCredentials: true }).subscribe({
      next: () => {
        this.passwordBusy = false;
        this.changeCurrentPassword = '';
        this.changeNewPassword = '';
        this.changeConfirmPassword = '';
        this.changeToken = '';
        this.passwordMessage = 'Password changed. Other signed-in sessions are now invalid.';
      },
      error: (error) => {
        this.passwordBusy = false;
        this.passwordError = this.readError(error, 'Could not change password. Please try again.');
      },
    });
  }

  // Use the server's message when it sent one (bad code, wrong password, and so on).
  private proof() { return {currentPassword:this.currentPassword, currentToken:this.currentToken}; }

  private readError(error: any, fallback: string): string {
    if (error && error.error && error.error.message) {
      return error.error.message;
    }
    return fallback;
  }
}
