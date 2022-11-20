import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { User } from 'src/app/shared/models/user';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements OnInit {
  public customers: User[];
  public customer: User;

  displayedColumns: string[] = [
    'username',
    'email',
    'phoneNumber',
    'company',
    'viewProfile',
  ];

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.userService.getAllClients().subscribe((customers: User[]) => {
      this.customers = customers;
      console.log(this.customers);
    });
  }

  getRecord(username: any) {
    alert(username);
  }

  routeToCustomerDetails(id: string) {
    this.userService.getById(id).subscribe((customer: User) => {
      this.customer = customer;
      this.router.navigateByUrl('/customerDetails', { state: this.customer });
      console.log('Customer page', this.customer);
    });
  }
}
