import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { first } from 'rxjs/operators';
import { Project } from 'src/app/shared/models/project';
import { ProjectService } from 'src/app/shared/services/project.service';

@Component({
  selector: 'app-pro-details',
  templateUrl: './pro-details.component.html',
  styleUrls: ['./pro-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProDetailsComponent implements OnInit {
  public displayedColumnsAccount: string[] = ['key', 'value'];
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
  public rating: number | string;
  public website: string;


  displayedColumnsProjects: string[] = ['serviceName', 'state', 'feedback', 'ratings', 'createdAt'];
  dataSourceProjects: any = [];

  displayedColumnsRatings: string[] = [
    'clientName',
    'service',
    'feedback',
    'ratings',
  ];
  dataSourceRatings: any = [];

  constructor(private projectService: ProjectService) {}

  ngOnInit() {
    this.view_account_info();
    this.view_projects();
  }

  public view_account_info() {
    
    this.alias = history.state.alias;
    this.name = history.state.firstName + ' ' + history.state.lastName;
    this.companyName = history.state.company;
    this.email = history.state.email;
    this.phoneNumber = history.state.phoneNumber;
    this.address =
      history.state.address.street +
      '\n' +
      history.state.address.city +
      ' ' +
      history.state.address.postalCode +
      ' ' +
      history.state.address.country;
    this.skills = history.state.skills;
    this.unitPrice =
      '$' + history.state.unitPrice + '/' + history.state.unitType;
    this.bio = history.state.bio;
    this.status = history.state.proStatus;
    this.rating = history.state.ratingSum && history.state.ratingCount
    ? parseFloat((history.state.ratingSum / history.state.ratingCount).toFixed(2))
    : "N/A";
    this.website = history.state.website;

    this.dataSource = [
      { key: 'Name', value: this.name },
      { key: 'Phone Number', value: this.phoneNumber },
      { key: 'Email', value: this.email },
      { key: 'Address', value: this.address },
      { key: 'Unit Price', value: this.unitPrice },
      { key: 'Status', value: this.status },
      { key: 'Bio', value: this.bio },
      { key: 'Skills', value: this.skills },
      { key: 'Rating', value: this.rating },
      { key: 'Website', value: this.website},
    ];
  }

  public view_projects() {
    this.projectService
      .getProjectsByProId(history.state._id)
      .pipe(first())
      .subscribe((projects: Project[]) => {
        
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
    customerUser: 'user1',
    customerId: 5,
    serviceType: 'Network Installation',
  },
  {
    projectId: 2,
    customerUser: 'user2',
    customerId: 5,
    serviceType: 'Windows Installation',
  },
];
