import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { User } from 'src/app/shared/models/user';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AdminCreateDialogComponent } from './admin-create-dialog/admin-create-dialog.component';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-admins',
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.scss'],
})
export class AdminsComponent implements OnInit {
  public admins: User[];
  public admin: User;
  displayedColumns: string[] = [
    'id',
    'username',
    'email',
    // 'permissions',
    // 'viewProfile',
    // 'editPermissions',
  ];

  //dataSource = ADMINS_DATA;
  constructor(
    private userService: UserService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    //get list of current admins
    this.userService.getAllAdmins().subscribe((admins: User[]) => {
      this.admins = admins;
      
      
    });
  }

  routeToAdminDetails(id: any) {
    
  }

  public onAdminCreate(): void {
    
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;

    /**
     * Opens the Complete Project dialog and calls the completeProject function with the
     * projectId and professionalId. After the data is sent, it will redirect to the current project
     * page and refresh the page so that the button will no longer be there.
     */
    this.dialog
      .open(AdminCreateDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((data: any) => {
        
        this.admin = data;
        
        this.admin.userType = "Admin";
        
        this.userService
          .registerUser(this.admin
          )
          .pipe(first())
          .subscribe((project) => {
            
            window.location.reload();
          });
      });
  }
}

export interface Admins {
  id: number;
  username: string;
  email: string;
  permissions: string;
}

// const ADMINS_DATA: Admins[] = [
//   {
//     id: 1,
//     username: 'admin',
//     email: 'jason@gmail.com',
//     permissions: 'Admin',
//   },
//   {
//     id: 2,
//     username: 'admin2',
//     email: 'jason@gmail.com',
//     permissions: 'Admin',
//   },
//   {
//     id: 3,
//     username: 'jacob',
//     email: 'jason@gmail.com',
//     permissions: 'Custom',
//   },
//   {
//     id: 4,
//     username: 'moderator',
//     email: 'jason@gmail.com',
//     permissions: 'Moderator',
//   },
// ];
