import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy,
  HostListener,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { first } from "rxjs/operators";
import { MAT_RIPPLE_GLOBAL_OPTIONS } from "@angular/material/core";
import { UserType } from "src/app/shared/enums/user-type.enum";
import { Project } from "src/app/shared/models/project";
import { User } from "src/app/shared/models/user";
import { AuthService } from "src/app/shared/services/auth.service";
import { ProjectService } from "src/app/shared/services/project.service";

@Component({
  selector: "app-projects-list",
  templateUrl: "./projects-list.component.html",
  styleUrls: ["./projects-list.component.scss"],
  encapsulation: ViewEncapsulation.None, // Use None to allow styles to affect deep components
  providers: [
    { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: { disabled: true } }, // Disable ripple effects globally
  ],
})
export class ProjectsListComponent implements OnInit, OnDestroy {
  public isCustomer: boolean = true;
  public isActive: boolean = false;
  public user: User | null;
  public projects: Project[] = [];
  public project: Project | null = null;
  private subscriptions: Subscription[] = [];

  // Default columns for desktop view
  displayedColumnsOngoing: string[] = [
    "serviceName",
    "dateCreated",
    "dateUpdated",
    "actions",
  ];

  displayedColumnsCompleted: string[] = [
    "serviceName",
    "status",
    "dateCreated",
    "dateUpdated",
    "actions",
  ];

  displayedColumnsRequest: string[] = ["serviceName", "dateCreated", "actions"];

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
    const userSub = this.authService.user.subscribe((u: User | null) => {
      this.isCustomer = u?.userType === UserType.Client;
      this.user = u;
    });
    this.subscriptions.push(userSub);
  }

  // Listen for window resize events to adjust columns
  @HostListener("window:resize", ["$event"])
  onResize() {
    this.adjustColumnsForScreenSize();
  }

  public ngOnInit(): void {
    // Initial column adjustment
    this.adjustColumnsForScreenSize();

    const sessionSub = this.authService.checkSession().subscribe({
      next: (user) => {
        this.user = user;
        this.authService.setUserValue(user);
        this.subscribeToUserChanges();
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error("Error fetching user", error);
      },
    });
    this.subscriptions.push(sessionSub);
  }

  public ngOnDestroy(): void {
    // Clean up all subscriptions to prevent memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // Adjust columns based on screen size for better mobile experience
  private adjustColumnsForScreenSize(): void {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // Simplified columns for mobile view
      this.displayedColumnsOngoing = ["serviceName", "actions"];
      this.displayedColumnsCompleted = ["serviceName", "status", "actions"];
      this.displayedColumnsRequest = ["serviceName", "actions"];
    } else {
      // Full columns for desktop view
      this.displayedColumnsOngoing = [
        "serviceName",
        "dateCreated",
        "dateUpdated",
        "actions",
      ];
      this.displayedColumnsCompleted = [
        "serviceName",
        "status",
        "dateCreated",
        "dateUpdated",
        "actions",
      ];
      this.displayedColumnsRequest = ["serviceName", "dateCreated", "actions"];
    }
    // Force change detection to update the view
    this.changeDetectorRef.detectChanges();
  }

  private subscribeToUserChanges(): void {
    const userChangeSub = this.authService.user.subscribe({
      next: (user) => {
        this.user = user;
        if (user?.userType === "Professional") {
          this.isCustomer = false;
          this.fetchProjects(user);
        } else if (user?.userType === "Client") {
          this.isCustomer = true;
          this.fetchProjects(user);
        }
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error("Unexpected error in user subscription", error);
      },
    });
    this.subscriptions.push(userChangeSub);
  }

  private fetchProjects(user: User | null): void {
    let observable: Observable<Project[]>;

    if (user?.userType === UserType.Client) {
      observable = this.projectService.getByClientId(user._id);
      this.changeDetectorRef.detectChanges();
    } else if (user?.userType === UserType.Professional) {
      observable = this.projectService.getByProfessionalId(user._id);
      this.changeDetectorRef.detectChanges();
    } else {
      return;
    }

    const projectsSub = observable
      .pipe(first())
      .subscribe((projects: Project[]) => {
        this.projects = projects;
        this.setupDataSource(projects);
        this.changeDetectorRef.detectChanges();
      });
    this.subscriptions.push(projectsSub);
  }

  private setupDataSource(projects: Project[]): void {
    const blankProject = new Project();
    blankProject.serviceName = "No project to show";

    // 对所有项目按dateUpdated排序（已修改）
    projects.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      return dateB.getTime() - dateA.getTime(); // 降序排列
    });

    const newProjects = projects.filter((pro) => pro.state === "Requested");
    const onGoingProjects = projects.filter((pro) => pro.state === "OnGoing");
    const completedOrPaid = projects.filter(
      (pro) => pro.state === "Completed" || pro.state === "Paid"
    );
    this.dataSourceRequest = new MatTableDataSource(
      newProjects.length > 0 ? newProjects : [blankProject]
    );
    this.dataSource = new MatTableDataSource(
      onGoingProjects.length > 0 ? onGoingProjects : [blankProject]
    );
    this.dataSourceCompleted = new MatTableDataSource(
      completedOrPaid.length > 0 ? completedOrPaid : [blankProject]
    );

    this.changeDetectorRef.markForCheck(); // Tell Angular to re-check the state
  }

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
    var routeString = "/project/" + projectID;
    this.router.navigate([routeString]);
  }

  public toggleView(): void {
    this.isCustomer = !this.isCustomer;
  }

  // Initiate payment by calling the payProject service and redirecting to Stripe checkout
  public onPayProject(projectId: string): void {
    if (!projectId) {
      console.error("Project ID is missing");
      return;
    }
    const paymentSub = this.projectService
      .payProject(projectId)
      .pipe(first())
      .subscribe({
        next: (response) => {
          console.log("Stripe checkout URL:", response.url);
          if (response.url) {
            window.location.href = response.url;
          } else {
            console.error("No Stripe URL returned from server");
          }
        },
        error: (error) => {
          console.error("Error paying project", error);
        },
      });
    this.subscriptions.push(paymentSub);
  }
}
