import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL: string;
  private readonly AUTH_API_URL: string;

  constructor(private httpClient: HttpClient) {
    this.API_URL = `${environment.apiEndpoint}/users`;

    this.AUTH_API_URL = `${environment.apiEndpoint}/auth`;
  }

  // Gets list of all users regardless of role
  public getAll(): Observable<User[]> {
    return this.httpClient.get<User[]>(this.API_URL).pipe(
      first(),
      map((users: User[]) => plainToClass(User, users))
    );
  }

  // Gets information about a single user based on user ID
  public getById(id: string): Observable<User> {
    return this.httpClient.get<User>(`${this.API_URL}/${id}`).pipe(
      first(),
      map((user: User) => plainToClass(User, user))
    );
  }

  //Get list of all clients from backend/database
  public getAllClients(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${this.API_URL}/clients`).pipe(
      first(),
      map((users: User[]) => plainToClass(User, users))
    );
  }

  // Gets list of all technicians from database
  public getAllProfessionals(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${this.API_URL}/professionals`).pipe(
      first(),
      map((users: User[]) => plainToClass(User, users))
    );
  }

  // Approves the professionals account
  public approveAccount(id: string): Observable<User> {
    return this.httpClient.put<User>(`${this.API_URL}/approve/${id}`, id).pipe(
      map((user: User) => plainToClass(User, user))
    );
  }

  //Get list of current admins from backend/database
  public getAllAdmins(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${this.API_URL}/admins`).pipe(
      first(),
      map((users: User[]) => plainToClass(User, users))
    );
  }

  // Registers a new admin from the admin panel
  public registerUser(user: User): Observable<User> {
    
    
    return this.httpClient
      .post<User>(`${this.AUTH_API_URL}/register`, user)
      .pipe(
        map((user: User) => {
          localStorage.setItem('user', JSON.stringify(user));
          return user;
        })
      );
  }
}
