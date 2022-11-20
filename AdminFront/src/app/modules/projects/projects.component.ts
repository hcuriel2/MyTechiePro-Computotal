import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { first, map, concatMap, take, tap, switchMap } from 'rxjs/operators';
import { Project } from 'src/app/shared/models/project';
import { User } from 'src/app/shared/models/user';
import { ProjectService } from 'src/app/shared/services/project.service';
import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';
import { ProjectWithUserNames } from 'src/app/shared/models/projectWithUserNames';
import { forkJoin } from 'rxjs';

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
        // save projects.
        // this.dataSourceProjects = projects;
        // console.log("Projects:")
        this.dataSourceProjectsWithNames = projects;
        console.log("Logging switchmap results")
        console.log(projects)
        let badProjectsList = []
        for (let i = 0; i < projects.length; i++) {
          if (projects[i].rating! < 3.0 && projects[i].rating! != null) {
            badProjectsList.push(projects[i]);
          }
        }
        console.log("logging bad projects list")
        console.log(badProjectsList)
        this.dataSourceProjectsWithNames = badProjectsList
        this.dataSourceBad = new MatTableDataSource(this.dataSourceProjectsWithNames);
        this.dataSource = new MatTableDataSource(this.dataSourceProjectsWithNames);
        // this.dataSource = new MatTableDataSource(this.dataSourceProjects);
        this.dataSource.sort = this.sort;

        console.log("logging datasource")
        console.log(this.dataSource);

        this.changeDetectorRef.markForCheck();
      });
  }

  // public addClientUserNamesToProjectsWithUserNames(projects: ProjectWithUserNames[]) : ProjectWithUserNames[]{
  //   for (let i = 0; i < projects.length; i++) {
  //     this.userService.getById(projects[i].client.toString()).pipe(first(), map(user => {
  //       projects[i].clientName = user.firstName + " " + user.lastName;
  //     }))
  //   }
  //   return projects;


  //   // public getName(id: string) {
  //   //   let somedata = this.userService
  //   //     .getById(id)
  //   //     .pipe(first())
  //   //     .subscribe((user: User) => {
  //   //       this.user = user;
  //   //       // console.log(this.user.firstName + ' ' + this.user.lastName);
  //   //       // return this.user.firstName + ' ' + this.user.lastName;
  //   //       // return this.user.firstName;
  //   //     });
  //   //   console.log(somedata)
  //   // }
  // }

  public changeProjectsToProjectsWithUserNames(projects: Project[]) {
    let tempProjectsWithNames = [];
    // console.log("starting switch from project to project with names")
    // console.log(projects)
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
      // tempProjectUserName.professionalName = projects[i].professional?.firstName! + ' ' + projects[i].professional?.lastName!;
      // tempProjectUserName.clientName = projects[i].client?.firstName + ' ' + projects[i].client?.lastName;
    }
    console.log("logging projectwithNames array");
    console.log(tempProjectsWithNames);
    return tempProjectsWithNames;
  }

  public getName(id: string) {
    this.userService
      .getById(id)
      .pipe(first())
      .subscribe((user: User) => {
        console.log(this.user.firstName + ' ' + this.user.lastName);
        return this.user.firstName + ' ' + this.user.lastName;
        // return this.user.firstName;
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
      .pipe(first())
  }

  public routeToUserDetails(id: any) {
    this.userService.getById(id).subscribe((user: User) => {
      if (user.userType == 'Professional') {
        this.router.navigateByUrl('/proDetails', { state: user });
      } else {
        this.router.navigateByUrl('/customerDetails', { state: user });
      }
      console.log('Pro page', user);
    });
  }
}
