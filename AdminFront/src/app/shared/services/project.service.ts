import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Project } from '../models/project';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly API_URL: string;

  constructor(private httpClient: HttpClient) {
    this.API_URL = `${environment.apiEndpoint}/projects`;
  }

  public getAll(): Observable<Project[]> {
    return this.httpClient
      .get<Project[]>(this.API_URL)
      .pipe(map((projects) => plainToClass(Project, projects)));
  }

  public getProjectsByProId(id: string): Observable<Project[]> {
    return this.httpClient
      .get<Project[]>(`${this.API_URL}/professional/${id}`)
      .pipe(map((project) => plainToClass(Project, project)));
  }
}
