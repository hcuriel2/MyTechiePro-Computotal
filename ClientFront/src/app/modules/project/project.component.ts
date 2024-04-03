import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  AfterViewChecked,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { first, takeUntil } from "rxjs/operators";
import { UserType } from "src/app/shared/enums/user-type.enum";
import { Project } from "src/app/shared/models/project";
import { User } from "src/app/shared/models/user";
import { AuthService } from "src/app/shared/services/auth.service";
import { ProjectService } from "src/app/shared/services/project.service";
import { ProjectCompleteDialogComponent } from "./project-complete-dialog/project-complete-dialog.component";
import { ProjectPayDialogComponent } from "./project-pay-dialog/project-pay-dialog.component";
import { ProjectReviewDialogComponent } from "./project-review-dialog/project-review-dialog.component";
import { ProjectStartDialogComponent } from "./project-start-dialog/project-start-dialog.component";

@Component({
  selector: "app-project",
  templateUrl: "./project.component.html",
  styleUrls: ["./project.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild("chatRoom") private myScrollContainer?: any;

  public isCustomer = true;
  public projectId?: string;
  public project: Project;
  public proSkills: string | null;
  public user: User | null;
  public messageInput: FormControl;
  public formGroup: FormGroup;
  public projectPrice?: string;

  private destroyed: Subject<void>;


  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private projectService: ProjectService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.destroyed = new Subject<void>();
    const blankUser: User = new User();
    this.project = new Project();
    this.project.client = blankUser;
    this.project.professional = blankUser;

    this.projectId = this.route.snapshot.params.id;

    this.authService.user.subscribe((u: User | null) => {
      this.isCustomer = u?.userType === UserType.Client;
      this.user = u;
    });

    this.messageInput = new FormControl(null);
    this.formGroup = new FormGroup({
      messageInput: this.messageInput,
    });
  }

    public ngOnInit(): void {

        this.authService.checkSession().subscribe({
            next: (user) => {
                this.authService.setUserValue(user);
                this.subscribeToUserChanges();
            },
            error: (error) => {
                console.error('Unexpected error in user subscription', error);
            }
        })
    }

    private subscribeToUserChanges(): void {
        this.authService.user.subscribe({
            next: (user) => {
                this.user = user;
                this.updateUIBasedOnUser(user);
            },
            error: (error) => {
                console.error('Unexpected error in user subscription', error);
            }
        })
    }

    private updateUIBasedOnUser(user: User | null): void {
        this.isCustomer = user?.userType === UserType.Client;
        
        if (this.projectId) {
            // Get project details from db.
            this.projectService
                .get(this.projectId)
                .pipe(takeUntil(this.destroyed))
                .subscribe((project: Project) => {
                    this.project = project;
                    this.proSkills = project.professional.skills.join(', ');
                    if (this.project.totalCost) {
                        this.projectPrice = "$" + this.project.totalCost;
                    } else {
                        this.projectPrice = "$0"
                    }
                    //console.log(this.project.totalCost)

                    // if (this.project.rating != 0) {
                    //     document.getElementById("project-component-review-button")!. = "true";
                    // }
                    this.changeDetectorRef.markForCheck();
                    
                });
        }

        this.scrollToBottom();
    }



    public ngOnDestroy(): void {
        this.destroyed.next();
        this.destroyed.complete();
    }

  public ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  /**
   * Auto-scrolls to bottom of chatroom.
   */
  public scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop =
        this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  /**
   * Displays dialog box for tech to change Project cost.
   */
  public onStartProject(): void {
    console.log("onStartProject");
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;

    this.dialog
      .open(ProjectStartDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((data: any) => {
        console.log("onStartProject after close after subscribe");
        this.projectService
          .startProject(
            this.project._id,
            data.totalCost,
            data.projectDetail,
            this.project.professional._id
          )
          .pipe(first())
          .subscribe((project) => {
            console.log("onStartProject after pipe after subscribe");
            this.router.navigateByUrl(`/project/${project._id}`).then(() => {
              window.location.reload();
            });
          });
      });
  }

  public onProjectOnGoing(): void {
    console.log("onProjectOnGoing");
  }

  public onCompleteProject(): void {
    console.log("onCompleteProject");
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;

    /**
     * Opens the Complete Project dialog and calls the completeProject function with the
     * projectId and professionalId. After the data is sent, it will redirect to the current project
     * page and refresh the page so that the button will no longer be there.
     */
    this.dialog
      .open(ProjectCompleteDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((data: any) => {
        console.log("onStartProject after close after subscribe");
        this.projectService
          .completeProject(
            this.project._id,
            data.email,
            this.project.professional._id,
            data.startDate,
            data.endDate,
            data.totalCost
          )
          .pipe(first())
          .subscribe((project) => {
            console.log("onStartProject after pipe after subscribe");
            this.router.navigateByUrl(`/project/${project._id}`).then(() => {
              window.location.reload();
            });
          });
      });
  }

  // Changes the status of the project to 'paid'
  public onPayProject(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;

    this.dialog
      .open(ProjectPayDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((isPaid: boolean) => {
        if (isPaid) {
          this.projectService
            .payProject(this.project._id, this.project.client._id)
            .pipe(first())
            .subscribe((project) => {
              this.router.navigateByUrl(`/project/${project._id}`).then(() => {
                window.location.reload();
              });
            });
        }
      });
  }

  // Adds a review to the project, including comments and a rating out of 5
  public onReviewProject(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;
    this.dialog
      .open(ProjectReviewDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((feedback: string) => {
        console.log(feedback);
        let feedobj = JSON.parse(feedback);
        this.projectService
          .rateProject(
            this.project._id,
            feedobj.rating,
            feedobj.comment,
            this.project.professional._id
          )
          .pipe(first())
          .subscribe((project) => {
            console.log("onStartProject after pipe after subscribe");
            this.router.navigateByUrl(`/project/${project._id}`).then(() => {
              window.location.reload();
            });
          });
      });
  }

  public toggleView(): void {
    this.isCustomer = !this.isCustomer;
  }

  public onSubmit(): void {
    const userId = this.user?._id;
      console.log(`OnSubmit user: ${userId}`)
        if (userId) {
            this.projectService
                .commentProject(
                    this.project._id,
                    this.messageInput.value,
                    userId
                )
                .pipe(first())
                .subscribe((project) => {
                    window.location.reload();
                });
        }
    }
  

  // Review Dialog Modal
  openReviewDialog(): void {
    this.dialog.open(ProjectReviewDialogComponent, {
      width: "75%",
      data: { projectID: this.projectId },
    })
  }
}

