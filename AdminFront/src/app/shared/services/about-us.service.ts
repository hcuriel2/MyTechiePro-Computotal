import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AboutUsService {
  private readonly API_URL: string;

  constructor(private httpClient: HttpClient) {
    this.API_URL = `${environment.apiEndpoint}/aboutus`;
  }

  public getAboutUsContent(): Observable<{ content: string }> {
    return this.httpClient.get<{ content: string }>(this.API_URL);
  }

  public updateAboutUsContent(data: { content: string }): Observable<void> {
    return this.httpClient.put<void>(this.API_URL, data);
  }
}