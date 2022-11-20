import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ClientRequest } from '../models/client-request';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ContactUsService {
  private readonly API_URL: string;

  constructor(private http: HttpClient) {
    this.API_URL = `${environment.apiEndpoint}/contactus`;
  }

  public getClientRequests(): Observable<ClientRequest[]> {
    return this.http
      .get<ClientRequest[]>(this.API_URL)
      .pipe(
        map((clientRequests: ClientRequest[]) =>
          plainToClass(ClientRequest, clientRequests)
        )
      );
  }
}
