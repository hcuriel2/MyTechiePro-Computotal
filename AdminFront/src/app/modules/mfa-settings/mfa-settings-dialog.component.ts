import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

// Admins never land on the client settings page after login, so they get the
// same authenticator controls here. It talks to the same /auth/mfa routes.
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
  public disablePassword = '';
  public message = '';
  public error = '';

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
    this.dialogRef.close(this.mfaEnabled);
  }

  // First-time setup and reset both call /mfa/setup. Confirm is what actually switches it on.
  public startSetup(replacing: boolean): void {
    this.busy = true;
    this.error = '';
    this.message = '';
    this.replacing = replacing;
    this.http
      .post<any>(`${this.api}/mfa/setup`, {}, { withCredentials: true })
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

  // Hides the QR only. A leftover temp secret doesn't affect login.
  public cancelSetup(): void {
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
      .post<any>(`${this.api}/mfa/confirm`, { token }, { withCredentials: true })
      .subscribe({
        next: () => {
          this.mfaEnabled = true;
          this.enrolling = false;
          this.qrDataUrl = '';
          this.manualSecret = '';
          this.confirmCode = '';
          this.busy = false;
          this.message = 'Authenticator is on for this account.';
        },
        error: (error) => {
          this.busy = false;
          this.error = this.readError(error, 'That code was not accepted.');
        },
      });
  }

  // The account password is required so an open admin session can't turn MFA off by itself.
  public disable(): void {
    if (!this.disablePassword) {
      this.error = 'Password is required to turn off the authenticator.';
      return;
    }
    this.busy = true;
    this.error = '';
    this.message = '';
    this.http
      .post<any>(
        `${this.api}/mfa/disable`,
        { password: this.disablePassword },
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          this.mfaEnabled = false;
          this.disablePassword = '';
          this.busy = false;
          this.message = 'Authenticator is off. Sign-in uses your password only.';
        },
        error: (error) => {
          this.busy = false;
          this.error = this.readError(error, 'Could not turn off the authenticator.');
        },
      });
  }

  // Use the server's message when it sent one (bad code, wrong password, and so on).
  private readError(error: any, fallback: string): string {
    if (error && error.error && error.error.message) {
      return error.error.message;
    }
    return fallback;
  }
}
