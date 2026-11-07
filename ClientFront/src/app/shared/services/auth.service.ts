import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { tap, switchMap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { User } from "../models/user";

// Enrollment data returned by /auth/mfa/setup. The secret lets the user scan the QR
// or enter it manually; the account is not protected until enrollment is confirmed.
export interface MfaSetup {
  qrDataUrl: string;
  secret: string;
  otpauthUrl: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;
  private readonly API_URL: string;
  private initialSessionChecked: boolean = false;

  constructor(private httpClient: HttpClient) {
    this.userSubject = new BehaviorSubject<User | null>(null);
    this.user = this.userSubject.asObservable();
    this.API_URL = `${environment.apiEndpoint}/auth`;
  }

  // Called on app init to check for an existing session
  public get isSessionChecked(): boolean {
    return this.initialSessionChecked;
  }

  public initSessionCheck(): void {
    if (!this.initSessionCheck) {
      this.checkSession().subscribe({
        next: (user) => {},
        error: (error) => {
          console.error("Error during session check", error);
        },
      });
    }
  }

  // Retrieves the current User's values
  public get userValue(): User | null {
    return this.userSubject.value;
  }

  // Sets the current User's value
  public setUserValue(user: User | null): void {
    this.userSubject.next(user);
  }

  public notifyAdmin(
    clientName: string,
    clientEmail: string,
    skill: string
  ): Observable<any> {
    const body = { clientName, clientEmail, skill };

    return this.httpClient.post<any>(`${this.API_URL}/notifyAdmin`, body);
  }

  // Register a new User
  public registerUser(user: User): Observable<User> {
    return this.httpClient.post<User>(`${this.API_URL}/register`, user, {
      withCredentials: true,
    });
  }

  // Signs in a User
  // Assigns the User's values to the UserSubject
  // It's then accessible through the 'this.user' value
  // If the account uses an authenticator, the password check returns
  // { mfaRequired: true } without a session cookie. Keep the user unset until the
  // follow-up request with the TOTP code succeeds and the server issues a session.
  public signIn(user: User): Observable<any> {
    return this.httpClient
      .post<any>(`${this.API_URL}/login`, user, { withCredentials: true })
      .pipe(
        tap((body: any) => {
          if (body && body.mfaRequired) {
            return;
          }
          this.setUserValue(body);
        })
      );
  }

  // Starts enrollment (or reset) and receives a pending key plus its QR image.
  // withCredentials sends the existing HttpOnly session cookie to the protected route.
  public setupMfa(): Observable<MfaSetup> {
    return this.httpClient.post<MfaSetup>(
      `${this.API_URL}/mfa/setup`,
      {},
      { withCredentials: true }
    );
  }

  // Proves the authenticator app can generate a code for the pending key. The server
  // activates that key only after a match, then this updates the cached on/off flag.
  public confirmMfa(token: string): Observable<{ mfaEnabled: boolean }> {
    return this.httpClient
      .post<{ mfaEnabled: boolean }>(
        `${this.API_URL}/mfa/confirm`,
        { token },
        { withCredentials: true }
      )
      .pipe(tap((result) => this.setMfaEnabled(result.mfaEnabled)));
  }

  // Requests MFA removal. The server checks the password again before deleting the
  // active and pending keys; this keeps an unattended session from disabling MFA.
  public disableMfa(password: string): Observable<{ mfaEnabled: boolean }> {
    return this.httpClient
      .post<{ mfaEnabled: boolean }>(
        `${this.API_URL}/mfa/disable`,
        { password },
        { withCredentials: true }
      )
      .pipe(tap((result) => this.setMfaEnabled(result.mfaEnabled)));
  }

  // Keeps settings and other subscribers in sync immediately after a successful change,
  // rather than waiting for the next session check.
  public setMfaEnabled(enabled: boolean): void {
    const current = this.userValue;
    if (current) {
      this.setUserValue({ ...current, mfaEnabled: enabled });
    }
  }

  // Modified the function - it needs to be a POST request in order to be secure
  public sendEmailResetPw(emailAddress: string): Observable<any> {
    const body = { emailAddress };
    return this.httpClient.post<any>(`${this.API_URL}/resetPassword`, body, {
      withCredentials: true,
    });
  }

  // Signs out the User
  // Updates the userSubject null, so no User values remain
  public signOut(): Observable<any> {
    return this.httpClient
      .post(`${this.API_URL}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(
          () => {
            this.userSubject.next(null);
            this.initialSessionChecked = false;
          },
          (error) => {}
        )
      );
  }

  // Retrieves the User information from the database
  // Passes it into the userSubject - which allows the UI to be applied from the User values
  public checkSession(): Observable<User> {
    return this.httpClient
      .get<User>(`${this.API_URL}/checkSession`, { withCredentials: true })
      .pipe(
        tap(
          (user: User) => {
            this.setUserValue(user);
            this.initialSessionChecked = true;
          },
          (error) => {
            this.setUserValue(null);
            this.initialSessionChecked = true;
          }
        )
      );
  }

  // Updates the User's information on the 'settings' page
  // All changes will update the User entry in the database
  updateUserSettings(userId: string, updates: any): Observable<any> {
    return this.httpClient.patch(
      `${this.API_URL}/settings/${userId}`,
      updates,
      { withCredentials: true }
    );
  }

  getUserInfo(): Observable<any> {
    return this.httpClient.get(`${this.API_URL}/getUserInfo`, {
      withCredentials: true,
    });
  }

  public verifyEmail(token: string): Observable<any> {
    return this.httpClient.get(`${this.API_URL}/verify/${token}`, {
      withCredentials: true,
    });
  }

  public resendVerificationEmail(email: string): Observable<any> {
    return this.httpClient.post(`${this.API_URL}/resend-verification`, {
      email,
    });
  }

  public checkVerification(token: string, session: string): Observable<any> {
    return this.httpClient.get<any>(`${this.API_URL}/check-verification`, {
      params: { token, session }
    });
  }

  public confirmVerification(token: string, session: string): Observable<any> {
    return this.httpClient.post<any>(`${this.API_URL}/confirm-verification`, 
      { token, session }, 
      { withCredentials: true }
    );
  }
}
