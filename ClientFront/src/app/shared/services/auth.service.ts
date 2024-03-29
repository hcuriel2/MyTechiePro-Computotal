import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
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
        this.userSubject = new BehaviorSubject<User | null>(
            JSON.parse(localStorage.getItem('user') || '{}')
        );
        this.user = this.userSubject.asObservable();

        this.API_URL = `${environment.apiEndpoint}/auth`;
        
    }

    public get userValue(): User | null {
        return this.userSubject.value;
    }

    public registerUser(user: User): Observable<User> {
        return this.httpClient
            .post<User>(`${this.API_URL}/register`, user, { withCredentials: true })
            .pipe(
                map((user: User) => {
                    localStorage.setItem('user', JSON.stringify(user));
                    this.userSubject.next(user);
                    return user;
                })
            );
    }

    public verifyMFA(id: string, token: string): Observable<Boolean> {
        return this.httpClient
            .post<Boolean>(`${this.API_URL}/verifyMfa`, {id, token});
    }

    public setupMFA(id: string, email: string): Observable<MfaDto> {
        return this.httpClient
            .post<MfaDto>(`${this.API_URL}/setupMfa`, {id, email});
    }

    public resetMFA(id: string): Observable<MfaDto> {
        return this.httpClient
            .post<MfaDto>(`${this.API_URL}/resetMfa`, {id});
    }

    public signIn(user: User): Observable<User> {
        return this.httpClient.post<User>(`${this.API_URL}/login`, user, { withCredentials: true }).pipe(
            map((user: User) => {
                localStorage.setItem('user', JSON.stringify(user));
                this.userSubject.next(user);
                return user;
            })
        );
    }

    // Modified the function - it needs to be a POST request in order to be secure
    public sendEmailResetPw(emailAddress: string): Observable<any> {
        const body = { emailAddress };
        return this.httpClient.post<any>(`${this.API_URL}/resetPassword`, body, { withCredentials: true });
    }


    public signOut(): void {
        localStorage.removeItem('user');
        this.userSubject.next(null);
    }


    getUserInfo(): Observable<any> {
        return this.httpClient.get(`${this.API_URL}/userInfo`, { withCredentials: true });
    }

    updateUserSettings(userId: string, updates: any): Observable<any> {
        return this.httpClient.patch(`${this.API_URL}/settings/${userId}`, updates);
    }
}
