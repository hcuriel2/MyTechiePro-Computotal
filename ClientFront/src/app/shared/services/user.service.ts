import { HttpClient } from '@angular/common/http';
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
        //Create object for filtering users by SKILL and LOCATION
        let filterReq = {
            skill: "",
            lat: 0,
            lng: 0,
            rnge: 10
        };
        filterReq.skill = skill;
        filterReq.rnge = rnge;
        filterReq.lat = lat;
        filterReq.lng = lng;
        let userObj = JSON.parse(localStorage.getItem("user")!);
        //receive the techie range selected by the user from local storage.
        // if (localStorage.getItem("range")) {
        //     console.log("list of range");
        //     console.log(localStorage.getItem("range"));
        //     filterReq.rnge = parseInt(localStorage.getItem("range")!, 10);

        // }
        // if (userObj.address.lat) {
        //     filterReq.lat = userObj.address.lat;
        //     filterReq.lng = userObj.address.lng;
        // }
        let filterString = JSON.stringify(filterReq)
        //send created filter object to backend and recieve list of filtered techies.
        return this.httpClient
            .get<User[]>(`${this.API_URL}/professionals/${filterString}`)
            .pipe(
                first(),
                map((users: User[]) => plainToClass(User, users))
            );
    }

    public resetPassword(password: ResetPassword, userId: string): Observable<ResetPassword> {
        return this.httpClient.put<ResetPassword>(`${this.API_URL}/reset/${userId}`, password).pipe(
            first(),
            map((password: ResetPassword) => plainToClass(ResetPassword, password))
        );
    }
}
