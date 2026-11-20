import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

  public getAboutUsContent(): Observable<{ content?: string; appendixContent?: string } | null> {
    return this.httpClient.get<{ content?: string; appendixContent?: string } | null>(this.API_URL);
  }

  public updateAboutUsContent(data: { content?: string; appendixContent?: string }): Observable<unknown> {
    return this.httpClient.put(this.API_URL, data, { withCredentials: true });
  }
}