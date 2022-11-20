import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ClientRequest } from '../models/contact-us';

@Injectable({
    providedIn: 'root',
})
export class ContactUsService {
    private readonly API_URL: string;

    constructor(private httpClient: HttpClient) {
        this.API_URL = `${environment.apiEndpoint}/contactus`;
    }

    public sendContactInfo(clientRequest: ClientRequest): Observable<ClientRequest> {
        return this.httpClient
            .post<ClientRequest>(this.API_URL, clientRequest)
            .pipe(
              map((clientRequest: ClientRequest) => 
              plainToClass(ClientRequest, clientRequest)
            )
            );
    }
}
