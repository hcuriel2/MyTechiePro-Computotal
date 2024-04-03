import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResetPassword } from '../models/resetPassword';
import { User } from '../models/user';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private readonly API_URL: string;

    constructor(private httpClient: HttpClient) {
        this.API_URL = `${environment.apiEndpoint}/users`;
    }

    public getAll(): Observable<User[]> {
        return this.httpClient.get<User[]>(this.API_URL).pipe(
            first(),
            map((users: User[]) => plainToClass(User, users))
        );
    }

    public getById(id: string): Observable<User> {
        return this.httpClient.get<User>(`${this.API_URL}/${id}`).pipe(
            first(),
            map((user: User) => plainToClass(User, user))
        );
    }

    public getAllClients(): Observable<User[]> {
        return this.httpClient.get<User[]>(`${this.API_URL}/clients`).pipe(
            first(),
            map((users: User[]) => plainToClass(User, users))
        );
    }

    public getAllProfessionals(): Observable<User[]> {
        return this.httpClient
            .get<User[]>(`${this.API_URL}/professionals`)
            .pipe(
                first(),
                map((users: User[]) => plainToClass(User, users))
            );
    }




    public getAllProfessionalsBySkill(skill: string, rnge: number, lat: number, lng:number): Observable<User[]> {   
        let filterReq = {
            skill: skill,
            rnge: rnge,
            lat: lat,
            lng: lng
        };
    
        let filterString = encodeURIComponent(JSON.stringify(filterReq));
        console.log(`Final request URL: ${this.API_URL}/professionals/${filterString}`);
    
        return this.httpClient
            .get<User[]>(`${this.API_URL}/professionals/${filterString}`)
            .pipe(
                first(),
                map((users: User[]) => {
                    const professionals = plainToClass(User, users);
                    professionals.forEach(pro => {
                        const proLat = pro.address?.lat ?? 'Not provided';
                        const proLng = pro.address?.lng ?? 'Not provided';
                        console.log(`Pro Name: ${pro.firstName}, Location: Lat ${proLat}, Lng ${proLng}`);
                    });
                    return professionals;
                })
            );
    }
    
    



    public resetPassword(password: ResetPassword, userId: string): Observable<ResetPassword> {
        return this.httpClient.put<ResetPassword>(`${this.API_URL}/reset/${userId}`, password).pipe(
            first(),
            map((password: ResetPassword) => plainToClass(ResetPassword, password))
        );
    }
}