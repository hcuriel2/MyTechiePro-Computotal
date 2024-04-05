import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetailsComponent implements OnInit {
  displayedColumnsAccount: string[] = ['key', 'value'];
  public dataSource: any = [];

  public name: string;
  public companyName: string;
  public address: string;
  public email: string;
  public phoneNumber: number;

  displayedColumnsProjects: string[] = [
    'projectId',
    'serviceUser',
    'serviceId',
    'serviceType',
  ];
  dataSourceProjects = PROJECTS_DATA;

  displayedColumnsComments: string[] = [
    'projectId',
    'serviceUser',
    'serviceId',
    'serviceType',
    'date',
    'comments',
  ];
  dataSourceComments = COMMENTS_DATA;

  constructor() {}

  ngOnInit(): void {
    this.view_account_info();
  }

  public view_account_info() {
    
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

    this.dataSource = [
      { key: 'Name', value: this.name },
      { key: 'Company Name', value: this.companyName },
      { key: 'Phone Number', value: this.phoneNumber },
      { key: 'Email', value: this.email },
      { key: 'Address', value: this.address },
    ];
  }
}

export interface Projects {
  projectId: number;
  serviceUser: string;
  serviceId: number;
  serviceType: string;
}

const PROJECTS_DATA: Projects[] = [
  {
    projectId: 1,
    serviceUser: 'pro1',
    serviceId: 5,
    serviceType: 'Network Installation',
  },
  {
    projectId: 2,
    serviceUser: 'pro2',
    serviceId: 5,
    serviceType: 'Windows Installation',
  },
];

export interface Comments {
  projectId: number;
  serviceUser: string;
  serviceId: number;
  serviceType: string;
  date: string;
  comments: string;
}

const COMMENTS_DATA: Comments[] = [
  {
    projectId: 1,
    serviceUser: 'pro1',
    serviceId: 5,
    serviceType: 'Network Installation',
    date: 'May 05, 2021',
    comments: 'Excellent service provided.',
  },
  {
    projectId: 2,
    serviceUser: 'pro2',
    serviceId: 5,
    serviceType: 'Windows Installation',
    date: 'May 05, 2021',
    comments:
      'Excellent service provided. The process was very smooth and efficient.',
  },
];
