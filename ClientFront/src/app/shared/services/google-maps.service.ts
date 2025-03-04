import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Observable, from } from "rxjs";
import { switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class GoogleMapsService {
  private scriptLoaded = false;
  private loadingPromise: Promise<void> | null = null;
  private readonly API_URL: string;

  isLoaded(): boolean {
    return this.scriptLoaded;
  }
  constructor(private httpClient: HttpClient) {
    this.API_URL = `${environment.apiEndpoint}/config`;
  }

  public getApiKey(): Observable<{ apiKey: string }> {
    return this.httpClient.get<{ apiKey: string }>(
      `${this.API_URL}/google-maps-key`
    );
  }

  loadGoogleMapsScript(): Promise<void> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }
    if (this.scriptLoaded) {
      return Promise.resolve();
    }
    this.loadingPromise = this.getApiKey()
      .pipe(
        switchMap((response) => {
          return new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${response.apiKey}&libraries=places&language=en`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
              this.scriptLoaded = true;
              resolve();
            };
            script.onerror = (error) => {
              this.loadingPromise = null; // Reset on error
              reject(error);
            };
            document.body.appendChild(script);
          });
        })
      )
      .toPromise();

    return this.loadingPromise;
  }
}
