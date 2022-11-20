import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ClientRequest } from 'src/app/shared/models/client-request';
import { ContactUsService } from 'src/app/shared/services/contact-us.service';

@Component({
  selector: 'app-client-request',
  templateUrl: './client-request.component.html',
  styleUrls: ['./client-request.component.scss'],
})
export class ClientRequestComponent implements OnInit {
  public clientRequests: ClientRequest[] | undefined;
  public dataSource: any;

  @ViewChild(MatSort, { static: false }) sort: MatSort | undefined;

  constructor(private contactUsService: ContactUsService) {}

  ngOnInit() {
    this.contactUsService
      .getClientRequests()
      .subscribe((clientRequests: ClientRequest[]) => {
        this.clientRequests = clientRequests;
        this.dataSource = new MatTableDataSource(this.clientRequests);
        this.dataSource.sort = this.sort;
        console.log(this.dataSource);
      });
  }

  displayedColumnsClients: string[] = ['createdAt', 'name', 'email', 'message'];
}
