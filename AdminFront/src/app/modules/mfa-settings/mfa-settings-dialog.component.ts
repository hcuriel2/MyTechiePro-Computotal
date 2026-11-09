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

  // First-time setup and reset both request a pending key. MFA becomes active only
  // after confirmSetup validates a code from the matching authenticator app.
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

  // Hide and clear the QR form. Any pending key is ignored at sign-in until confirmed.
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

  public disable(): void {
    this.busy = true;
    this.error = '';
    this.message = '';
    this.http
      .post<any>(`${this.api}/mfa/disable`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.mfaEnabled = false;
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
