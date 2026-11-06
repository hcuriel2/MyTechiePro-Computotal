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
    // withCredentials sends the admin login cookie along with the request.
    return this.httpClient.get<{ content: string }>(this.API_URL, {
      withCredentials: true,
    });
  }

  // Returns the saved text now, instead of an empty body, so the page can show what was stored.
  public updateAboutUsContent(data: {
    content: string;
  }): Observable<{ content: string }> {
    return this.httpClient.put<{ content: string }>(this.API_URL, data, {
      withCredentials: true,
    });
  }
}