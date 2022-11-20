import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { User } from 'src/app/shared/models/user';
import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';
import { ProjectService } from 'src/app/shared/services/project.service';
import { Project } from 'src/app/shared/models/project';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, MatIconModule {

  public clientAmount: number;
  public proAmount: number;
  public projectAmount: number;


  constructor(private router: Router, private userService: UserService,
    private projectService: ProjectService) {}

  ngOnInit(): void {
    this.userService.getAllClients().subscribe((customers: User[]) => {
      this.clientAmount = customers.length;
    });

    this.userService.getAllProfessionals().subscribe((pros: User[]) => {
      this.proAmount = pros.length;
    })


    this.projectService
    .getAll()
    .pipe(first())
    .subscribe((projects: Project[]) => {
      // save projects.
      this.projectAmount = projects.length;
    });
  }

  elements: any = [
    {
      id: 1,
      username: 'admin',
      email: 'jason@gmail.com',
      password: '**********',
      permissions: 'Admin',
    },
    {
      id: 2,
      username: 'admin2',
      email: 'jason@gmail.com',
      password: '**********',
      permissions: 'Admin',
    },
    {
      id: 3,
      username: 'jacob',
      email: 'jason@gmail.com',
      password: '**********',
      permissions: 'Custom',
    },
    {
      id: 4,
      username: 'moderator',
      email: 'jason@gmail.com',
      password: '**********',
      permissions: 'Moderator',
    },
  ];

  headElements = ['ID', 'Username', 'Email', 'Password', 'Permissions'];
}
