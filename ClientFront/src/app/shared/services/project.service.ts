import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Project } from '../models/project';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ProjectService {
    private readonly API_URL: string;

    constructor(private httpClient: HttpClient, private router:Router) {
        this.API_URL = `${environment.apiEndpoint}/projects`;
    }

    public getProjectsByProId(id: string): Observable<Project[]> {
        return this.httpClient
          .get<Project[]>(`${this.API_URL}/professional/${id}`, { withCredentials: true })
          .pipe(map((project) => plainToClass(Project, project)));
      }

    

    public getAll(): Observable<Project[]> {
        return this.httpClient
            .get<Project[]>(this.API_URL, { withCredentials: true })
            .pipe(map((projects) => plainToClass(Project, projects)));
    }

    public get(id: string): Observable<Project> {
        return this.httpClient
            .get<Project>(`${this.API_URL}/${id}`, { withCredentials: true })
            .pipe(map((project) => plainToClass(Project, project)));
    }

    public getByClientId(clientId: string): Observable<Project[]> {
        return this.httpClient
            .get<Project[]>(`${this.API_URL}/client/${clientId}`, { withCredentials: true })
            .pipe(map((projects) => plainToClass(Project, projects)));
    }

    public getByProfessionalId(professionalId: string): Observable<Project[]> {
        return this.httpClient
            .get<Project[]>(`${this.API_URL}/professional/${professionalId}` , { withCredentials: true })
            .pipe(map((projects) => plainToClass(Project, projects)));
    }

    public create(
        categoryId: string,
        serviceId: string,
        serviceName: string,
        professionalId: string,
        clientId: string
    ): Observable<Project> {
        return this.httpClient
            .post<Project>(this.API_URL, {
                categoryId,
                serviceId,
                serviceName,
                professionalId,
                clientId,
            }, { withCredentials: true })
            .pipe(map((project: Project) => plainToClass(Project, project)));
    }

    public startProject(
        projectId: string,
        totalCost: string,
        projectDetails: string,
        professionalId: string
    ) {
        return this.httpClient.patch<Project>(
            `${this.API_URL}/start/${projectId}`,
            {
                totalCost,
                projectDetails,
                professionalId,
            }, { withCredentials: true },
        ).pipe(
            catchError((err) => {
                console.log('error caught in service')
                console.error(err);
       
                //Handle the error here
                window.location.reload();
                return throwError(err);    //Rethrow it back to component
              })
        );
    }

    // public startProject( projectId: string, totalCost: string, projectStartDate: string, projectEndDate: string, projectDetails: string, professionalId: string) {
    //     console.log("startProject");
    //     this.router.navigateByUrl('/project/${project_id}').then(() => {
    //         window.location.reload();
    //     });
    // }

    public completeProject(
        projectId: string,
        eTransferEmail: string,
        professionalId: string,
        projectStartDate: string,
        projectEndDate: string,
        totalCost: string
    ): Observable<Project> {
        return this.httpClient.patch<Project>(
            `${this.API_URL}/complete/${projectId}`,
            {
                eTransferEmail,
                professionalId,
                projectStartDate,
                projectEndDate,
                totalCost
            }, { withCredentials: true },
        ).pipe(
            catchError((err) => {
                console.log('error caught in service')
                console.error(err);
       
                //Handle the error here
                window.location.reload();
                return throwError(err);    //Rethrow it back to component
              })
        );;
    }

    public payProject(
        projectId: string,
        clientId: string
    ): Observable<Project> {
        return this.httpClient.patch<Project>(
            `${this.API_URL}/pay/${projectId}`,
            {
                clientId,
            }, { withCredentials: true },
        ).pipe(
            catchError((err) => {
                console.log('error caught in service')
                console.error(err);
       
                //Handle the error here
                window.location.reload();
                return throwError(err);    //Rethrow it back to component
              })
        );
    }


    public rateProject(
        projectId: string,
        rating: number,
        feedback: string,
        professionalId: string
    ): Observable<Project> {
        return this.httpClient.patch<Project>(
            `${this.API_URL}/feedback/${projectId}`,
            {
                rating,
                feedback,
                professionalId
            }, { withCredentials: true }
        );
    }

    public commentProject(
        projectId: string,
        text: string,
        userId: string
    ): Observable<Project> {
        return this.httpClient.patch<Project>(
            `${this.API_URL}/comment/${projectId}`,
            {
                text,
                userId,
            }, { withCredentials: true }
        );
    }
    
}
