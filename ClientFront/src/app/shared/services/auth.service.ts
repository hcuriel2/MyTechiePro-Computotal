import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { tap, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { MfaDto } from '../models/mfaDto';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private userSubject: BehaviorSubject<User | null>;
    public user: Observable<User | null>;
    private readonly API_URL: string;

    constructor(private httpClient: HttpClient) {
        this.userSubject = new BehaviorSubject<User | null>(null);
        this.user = this.userSubject.asObservable();
        this.API_URL = `${environment.apiEndpoint}/auth`;
    }

    // Retrieves the current User's values
    public get userValue(): User | null {
        console.log('userValue called')
        return this.userSubject.value;
    }

    // Sets the current User's value
    public setUserValue(user: User | null): void {
        this.userSubject.next(user);
    }

    // Register a new User
    public registerUser(user: User): Observable<User> {
        return this.httpClient.post<User>(`${this.API_URL}/register`, user, { withCredentials: true });  
    }

    // Signs in a User
    // Assigns the User's values to the UserSubject
    // It's then accessible through the 'this.user' value
    public signIn(user: User): Observable<User> {
        console.log('authservice: attempting signin for', user)
         return this.httpClient.post<User>(`${this.API_URL}/login`, user, { withCredentials: true }).pipe(
          tap((user: User) => {
            this.userSubject.next(user);
            console.log('SIGN IN function', user);
          }),
          //switchMap(() => this.checkSession())
        );
    }

    // Modified the function - it needs to be a POST request in order to be secure
    public sendEmailResetPw(emailAddress: string): Observable<any> {
        const body = { emailAddress };
        return this.httpClient.post<any>(`${this.API_URL}/resetPassword`, body, { withCredentials: true });
    }

    // Signs out the User
    // Updates the userSubject null, so no User values remain
    public signOut(): Observable<any> {
        return this.httpClient.post(`${this.API_URL}/logout`, {}, { withCredentials: true }).pipe(
            tap(() => {
                this.userSubject.next(null);
            },
            error => {
                console.log('SIGNOUT ERROR', error);
            })
        )
    }

    // Retrieves the User information from the database
    // Passes it into the userSubject - which allows the UI to be applied from the User values
    public checkSession(): Observable<User> {
        return this.httpClient.get<User>(`${this.API_URL}/checkSession`, { withCredentials: true }).pipe(
            tap((user: User) => {
                this.userSubject.next(user)
            }, error => {
                console.log('auth service no session found or error', error);
            }            
            )
        );
    }
      

    // Updates the User's information on the 'settings' page
    // All changes will update the User entry in the database
    updateUserSettings(userId: string, updates: any): Observable<any> {
        console.log(userId)
        return this.httpClient.patch(`${this.API_URL}/settings/${userId}`, updates, { withCredentials: true });
    }

    getUserInfo(): Observable<any> {
        return this.httpClient.get(`${this.API_URL}/userInfo`, { withCredentials: true });
    }
}
