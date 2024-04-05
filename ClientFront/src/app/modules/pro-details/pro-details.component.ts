import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";
import { first } from "rxjs/operators";
import { Project } from "src/app/shared/models/project";
import { ProjectService } from "src/app/shared/services/project.service";

import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin } from "rxjs";
import { Constants } from "src/app/shared/constants/constants";
import { Category } from "src/app/shared/models/category";
import { User } from "src/app/shared/models/user";
import { AuthService } from "src/app/shared/services/auth.service";
import { CategoryService } from "src/app/shared/services/category.service";
import { UserService } from "src/app/shared/services/user.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-pro-details",
  templateUrl: "./pro-details.component.html",
  styleUrls: ["./pro-details.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProDetailsComponent implements OnInit {
  public displayedColumnsAccount: string[] = ["key", "value"];
  public dataSource: any = [];
  public dataSourceBad: any = [];

  public alias: string;
  public name: string;
  public companyName: string;
  public email: string;
  public phoneNumber: string;
  public address: string;
  public skills: string[];
  public unitPrice: any;
  public unitType: string;
  public bio: string;
  public status: string;
  public avgRating: number;
  public rating: number;
  public website: string;
  public id: string;

  // from service-technician-select.component
  public professionals: User[];
  public filteredProfessionals: User[];
  public selectedTechID?: string;
  public categorySelection: string;
  public serviceSelection: string;
  public categories: Category[];
  public range: number = 10;
  public selectedOption: string = "10";
  public starRating: number;

  // toggle visibilty variables
  public searchFeedback: string;
  public isFeedbackVisible: boolean = false;
  public isShowMoreBtnVisible: boolean = false;
  public isCardListVisible: boolean = false;

  // geolocation variables
  public latitude: number = 0;
  public longitude: number = 0;
  public areaCode: string;
  // public canadaPostalCodeRegex: RegExp = new RegExp(
  //   "^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z][ -]?[0-9]??[ABCEGHJ-NPRSTV-Z]??[0-9]??$",
  //   "im"
  // );
  // public usZipCodeRegex: RegExp = new RegExp(
  //   "^[0-9]{5}(?:[ -][0-9]{4})?$",
  //   "im"
  // );
  public googleMapApiUrl: string =
    "https://maps.googleapis.com/maps/api/geocode/json";
  private googleMapApiKey: string = "AIzaSyDS_bEoW2tmdRW-WyWaZIS_gnsbWQ1stUU";

  //Options for selecting range for techie location.
  options = [
    { name: "10", value: 10 },
    { name: "20", value: 20 },
    { name: "50", value: 50 },
    { name: "100", value: 100 },
    { name: "All", value: 9999999 },
  ];

  displayedColumnsProjects: string[] = [
    "serviceName",
    "state",
    "feedback",
    "ratings",
    "createdAt",
  ];
  dataSourceProjects: any = [];

  displayedColumnsRatings: string[] = [
    "clientName",
    "service",
    "feedback",
    "ratings",
  ];
  dataSourceRatings: any = [];

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private userService: UserService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient
  ) {
    this.route.queryParams.subscribe((params) => {
      this.categorySelection = params.category;
      this.serviceSelection = params.service;
    });
  }

  ngOnInit() {
    this.view_account_info();
    // this.view_projects();
  }

  public view_account_info() {
    
    this.id = history.state.pro._id;
    this.alias = history.state.pro.alias;
    this.name = history.state.pro.firstName + " " + history.state.pro.lastName;
    this.companyName = history.state.pro.company;
    this.email = history.state.email;
    this.phoneNumber = history.state.pro.phoneNumber;
    this.address =
      history.state.pro.address.street +
      "\n" +
      history.state.pro.address.city +
      " " +
      history.state.pro.address.postalCode +
      " " +
      history.state.pro.address.country;
    this.skills = history.state.pro.skills;
    this.unitPrice =
      "$" + history.state.pro.unitPrice + "/" + history.state.pro.unitType;
    this.bio = history.state.pro.bio;
    this.status = history.state.pro.proStatus;
    this.rating = history.state.pro.ratingSum / history.state.pro.ratingCount;
    this.website = history.state.pro.website;
    this.categorySelection = history.state.categoryId;

    this.dataSource = [
      { key: "Name", value: this.name },
      { key: "Phone Number", value: this.phoneNumber },
      { key: "Email", value: this.email },
      { key: "Address", value: this.address },
      { key: "Unit Price", value: this.unitPrice },
      { key: "Status", value: this.status },
      { key: "Bio", value: this.bio },
      { key: "Skills", value: this.skills },
      { key: "Rating", value: this.rating },
      { key: "Website", value: this.website },
    ];
  }

  public techSelect(id: string): void {
    this.selectedTechID = id;
    this.createProject();
    // const serviceName = history.state.serviceName;
    //  
  }

  // Create a project listing with selected techie and redirect user to project page.
  public createProject(): void {
    this.authService.checkSession().subscribe({
      next: (user: User | null) => {
        const clientId = user?._id;
        const professionalId = this.selectedTechID;
        const serviceName = history.state.serviceName;
        const categoryId = this.categorySelection;
        const serviceId = history.state.serviceId;

        if (!clientId) {
            console.warn(
              "You're not logged in, please log in and try it again"
            );

            this.translateService
              .get('Message.SignInFirst')
              .pipe(first())
              .subscribe((translation) => {
                const config = new MatSnackBarConfig();
                config.duration = Constants.ShortDuration;

                this.snackBar.open(translation, 'OK', config);
                });
        } else if (
            clientId &&
            professionalId &&
            serviceName &&
            categoryId &&
            serviceId
          ) {
            this.projectService
              .create(
                categoryId,
                serviceId,
                serviceName,
                professionalId,
                clientId
              )
                .subscribe((project: Project) => {
                  this.router.navigateByUrl(`/project/${project._id}`);
                  });
        } else {
                console.warn(
                    'ServiceTechnicianSelectComponent: createProject: some data is missing'
                );
            }
        },
        error: (err) => {
            console.error('Error fetching user info:', err);
            // Handle the error appropriately
        }
    });
}



  public view_projects() {
    this.projectService
      .getProjectsByProId(history.state._id)
      .pipe(first())
      .subscribe((projects: Project[]) => {
        // 
        this.dataSourceProjects = projects;
        // this.dataSource = new MatTableDataSource(this.dataSourceProjects);
        // this.dataSource.sort = this.sort;
        
      });
  }
}

export interface Projects {
  projectId: number;
  customerUser: string;
  customerId: number;
  serviceType: string;
}

const PROJECTS_DATA: Projects[] = [
  {
    projectId: 1,
    customerUser: "user1",
    customerId: 5,
    serviceType: "Network Installation",
  },
  {
    projectId: 2,
    customerUser: "user2",
    customerId: 5,
    serviceType: "Windows Installation",
  },
];
