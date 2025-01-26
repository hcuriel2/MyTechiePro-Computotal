import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { first, map, concatMap, take, tap, switchMap, catchError } from 'rxjs/operators';
import { Project } from 'src/app/shared/models/project';
import { User } from 'src/app/shared/models/user';
import { ProjectService } from 'src/app/shared/services/project.service';
import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';
import { ProjectWithUserNames } from 'src/app/shared/models/projectWithUserNames';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent implements OnInit {
  public displayedColumnsProjects: string[] = [
    'state',
    'serviceName',
    'createdAt',
    'professional',
    'customer',
    'feedback',
    'ratings'
  ];
  public dataSourceProjects: Project[] | undefined;
  public dataSourceBadProjects: Project[] | undefined;
  public dataSourceProjectsWithNames: ProjectWithUserNames[] | undefined;
  public dataSourceBadProjectsWithNames: ProjectWithUserNames[] | undefined;
  public dataSource: any;
  public dataSourceBad: any;
  public user: User;

  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
  ) { }

  public ngOnInit(): void {
    this.projectService
      .getAll()
      .pipe(first(), 
      map(projects => this.changeProjectsToProjectsWithUserNames(projects)),
      switchMap(projects => forkJoin(
        projects.map(project => this.appendClientUser(project))
      )),
      switchMap(projects => forkJoin(
        projects.map(project => this.appendProUser(project))
      ))
     )
      .subscribe((projects: ProjectWithUserNames[]) => {
        this.dataSourceProjectsWithNames = projects;
        
        
        let badProjectsList = []
        for (let i = 0; i < projects.length; i++) {
          if (projects[i].rating! < 3.0 && projects[i].rating! != null) {
            badProjectsList.push(projects[i]);
          }
        }
        
        
        this.dataSourceProjectsWithNames = badProjectsList
        this.dataSourceBad = new MatTableDataSource(this.dataSourceProjectsWithNames);
        this.dataSource = new MatTableDataSource(projects);
        this.dataSource.sort = this.sort;

        
        

        this.changeDetectorRef.markForCheck();
      });
  }

  public changeProjectsToProjectsWithUserNames(projects: Project[]) {
    let tempProjectsWithNames = [];
    for (let i = 0; i < projects.length; i++) {
      let tempProjectUserName = new ProjectWithUserNames;
      tempProjectUserName.state = projects[i].state;
      tempProjectUserName._id = projects[i]._id;
      tempProjectUserName.serviceName = projects[i].serviceName;
      tempProjectUserName.serviceId = projects[i].serviceId;
      tempProjectUserName.rating = projects[i].rating;
      tempProjectUserName.createdAt = projects[i].createdAt;
      tempProjectUserName.updatedAt = projects[i].updatedAt;
      tempProjectUserName.professional = projects[i].professional!;
      tempProjectUserName.client = projects[i].client!;
      tempProjectUserName.comments = projects[i].comments;
      tempProjectUserName.professionalName = "";
      tempProjectUserName.clientName = "";
      tempProjectsWithNames.push(tempProjectUserName)
    }
    
    
    return tempProjectsWithNames;
  }

  public getName(id: string) {
    this.userService
      .getById(id)
      .pipe(first())
      .subscribe((user: User) => {
        
        return this.user.firstName + ' ' + this.user.lastName;
      });
  }

  public appendProUser(project: ProjectWithUserNames) {
    return this.getNameV2(project.professional!.toString()).pipe(
      map(user => ({
        ...project,
        professionalName: user.firstName + " " + user.lastName
      }))    
    )
  }

  public appendClientUser(project: ProjectWithUserNames) {
    return this.getNameV2(project.client!.toString()).pipe(
      map(user => ({
        ...project,
        clientName: user.firstName + " " + user.lastName
      }))    
    )
  }

  public getNameV2(id: string) {
    return this.userService
      .getById(id)
      .pipe(first(), catchError(() => of({ firstName: 'N/A', lastName: '' })))
  }

  public routeToUserDetails(id: any) {
    this.userService.getById(id).subscribe((user: User) => {
      if (user.userType == 'Professional') {
        this.router.navigateByUrl('/proDetails', { state: user });
      } else {
        this.router.navigateByUrl('/customerDetails', { state: user });
      }
      
    });
  }
}
