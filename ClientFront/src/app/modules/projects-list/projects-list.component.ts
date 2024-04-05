import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { UserType } from 'src/app/shared/enums/user-type.enum';
import { Project } from 'src/app/shared/models/project';
import { User } from 'src/app/shared/models/user';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ProjectService } from 'src/app/shared/services/project.service';

@Component({
    selector: 'app-projects-list',
    templateUrl: './projects-list.component.html',
    styleUrls: ['./projects-list.component.scss'],
    //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsListComponent implements OnInit {

    public isCustomer: boolean = true;
    public isActive: boolean = false;
    public user: User | null;
    public projects: Project[] = [];

    displayedColumns: string[] = [
        'serviceName',
        'status',
        'dateCreated',
        'dateCompleted',
        'viewProject',
    ];
    displayedColumnsRequest: string[] = [
        'serviceName',
        'dateCreated',
        'viewProject',
    ];

    public dataSource: MatTableDataSource<Project>;
    public dataSourceRequest: MatTableDataSource<Project>;
    public dataSourceCompleted: MatTableDataSource<Project>;
    public dataSourceTechie: MatTableDataSource<Project>;

    constructor(
        private router: Router,
        private authService: AuthService,
        private projectService: ProjectService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.authService.user.subscribe((u: User | null) => {
            this.isCustomer = u?.userType === UserType.Client;
            this.user = u;
        });
    }


    public ngOnInit(): void {
        console.log('proj list initif ')
        this.authService.checkSession().subscribe({
            next: (user) => {
                console.log('project list init - user data:', user)

                this.user = user;
                console.log(user);
                this.authService.setUserValue(user);
                this.subscribeToUserChanges();
                this.changeDetectorRef.detectChanges();
            },
            error: (error) => {
                console.error('Error fetching user', error);
            }
        })
    }

    private subscribeToUserChanges(): void {
        this.authService.user.subscribe({
          next: (user) => {
            console.log(user);
            this.user = user;
            if (user?.userType === 'Professional') {
              this.isCustomer = false;
              this.fetchProjects(user);
            } else if (user?.userType === 'Client') {
              this.isCustomer = true;
              this.fetchProjects(user);
            }
            this.changeDetectorRef.detectChanges();
          },
          error: (error) => {
            console.error('Unexpected error in user subscription', error);
          }
        })
    }
      

    private fetchProjects(user: User | null): void {
        console.log('fetchprojects')
        let observable: Observable<Project[]>;
      
        if (user?.userType === UserType.Client) {
          observable = this.projectService.getByClientId(user._id);
          this.changeDetectorRef.detectChanges();
        } else if (user?.userType === UserType.Professional){
          observable = this.projectService.getByProfessionalId(user._id);
          this.changeDetectorRef.detectChanges();
        } else {
          return;  
        }
        
        observable.pipe(first()).subscribe((projects: Project[]) => {
          this.projects = projects;
          this.setupDataSource(projects);
          this.changeDetectorRef.detectChanges(); 
        });
      }
      
      private setupDataSource(projects: Project[]): void {
        const blankProject = new Project();
        blankProject.serviceName = 'No project to show';
      
        const newProjects = projects.filter((pro) => pro.state === 'Requested');
        const onGoingProjects = projects.filter((pro) => pro.state === 'OnGoing');
        const completedOrPaid = projects.filter((pro) => pro.state === 'Completed' || pro.state === 'Paid');
      
        // this.dataSourceRequest = new MatTableDataSource(newProjects.length !== 0 ? newProjects : [blankProject]);
        // this.dataSource = new MatTableDataSource(onGoingProjects.length !== 0 ? onGoingProjects : [blankProject]);
        // this.dataSourceCompleted = new MatTableDataSource(completedOrPaid.length !== 0 ? completedOrPaid : [blankProject]);
      
        this.dataSourceRequest = new MatTableDataSource(newProjects.length > 0 ? newProjects : [blankProject]);
        this.dataSource = new MatTableDataSource(onGoingProjects.length > 0 ? onGoingProjects : [blankProject]);
        this.dataSourceCompleted = new MatTableDataSource(completedOrPaid.length > 0 ? completedOrPaid : [blankProject]);

        console.log("DataSource projects:", projects);


        this.changeDetectorRef.markForCheck();  // Tell Angular to re-check the state.
      }
      
    
    /*
    public ngOnInit(): void {
        
        //this.authService.checkSession().subscribe((user: User | null) => {
            this.authService.user.subscribe((user: User | null) => {

            this.user = user;
            this.changeDetectorRef.detectChanges();

            if (user?.userType == 'Professional') {
                const root = document.documentElement;
                root.style.setProperty('--background-color', 'red');
            } else {
                const root = document.documentElement;
                root.style.setProperty('--background-color', 'blue');
            }
        })


        let observable: Observable<Project[]>;
        if (this.isCustomer) {
            observable = this.projectService.getByClientId(
                this.user?._id || ''
            );
        } else {
            observable = this.projectService.getByProfessionalId(
                this.user?._id || ''
            );      
        }
        observable.pipe(first()).subscribe((projects: Project[]) => {
            this.projects = projects;
            const blankProject = new Project();
            blankProject.serviceName = 'No project to show';

            const newProjects = this.projects.filter(
                (pro) => pro.state === 'Requested'
            );

            const onGoingProjects = this.projects.filter(
                (pro) => pro.state === 'OnGoing'
            );

            const completedOrPaid = this.projects.filter(
                (pro) => (pro.state === 'Completed' || pro.state === 'Paid')
            );


            console.log(newProjects, onGoingProjects);

            this.dataSourceRequest = new MatTableDataSource(
                newProjects.length !== 0 ? newProjects : [blankProject]
            );
            this.dataSource = new MatTableDataSource(
                onGoingProjects.length !== 0 ? onGoingProjects : [blankProject]
            );

            this.dataSourceCompleted = new MatTableDataSource(
                completedOrPaid.length !== 0 ? completedOrPaid : [blankProject]
            );

            this.changeDetectorRef.markForCheck();
        });
    }*/

    public applyFilterCompletedClient(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceCompleted.filter = filterValue.trim().toLowerCase();
    }

    public applyFilterOngoingClient(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    public applyFilterTechie(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    public goToProject(projectID: number): void {
        console.log(projectID);
        var routeString = '/project/' + projectID;
        this.router.navigate([routeString]);
    }

    public toggleView(): void {
        this.isCustomer = !this.isCustomer;
    }
}