import { Component, OnInit } from '@angular/core';
import { ChildActivationStart, Router } from '@angular/router';
import { User } from 'src/app/shared/models/user';
import { UserService } from 'src/app/shared/services/user.service';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-pros',
  templateUrl: './pros.component.html',
  styleUrls: ['./pros.component.scss'],
})
export class ProsComponent implements OnInit {
  public pros: User[] = [];
  public pro: User;
  public avgRating: any = [];

  public dataSource: MatTableDataSource<User>;

  displayedColumns: string[] = [
    'username',
    'status',
    'email',
    'rating',
    'viewProfile',
    'approve',
  ];

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAllProfessionals().subscribe((pros: User[]) => {

      this.pros = pros;

      this.dataSource = new MatTableDataSource(
        pros
      );


      

      // var userPerformance;
      // var ratingSum = 0;
      // var avg = 0;

      // iterates over each user in pros array. The variable users is an index value, ex- 0, 1, 2 ,etc.
      // for (var users in this.pros) {
        // 
        // userPerformance = this.pros[users].performance;
        // pros[users].rating = this.pros[users].ratingSum / this.pros[users].ratingCount;

        //checks if there is a performance field for that pro
        // if (userPerformance != undefined) {
        //   for (var i = 0; i < userPerformance.length; i++) {
        //     ratingSum += userPerformance[i].rating;
        //   }
        //   avg = ratingSum / userPerformance.length;
        //   pros[users].rating = avg;
        //   
        // }
      //}
    });



    // let observable: Observable<User[]>;
    // this.pros = new MatTableDataSource(
    //   this.pros
    // );
       
  };

  // Displays details about the specified technician
  routeToProDetails(id: any) {
    this.userService.getById(id).subscribe((pro: User) => {
      this.pro = pro;
      this.router.navigateByUrl('/proDetails', { state: this.pro });
      
    });
  }

  // Approve professional account
  approvePro(id: any) {
    this.userService.approveAccount(id).subscribe((pro: User) => {
      this.ngOnInit()
    });
  }

  // public doFilter = (value: string) => {
  //   this.dataSource.filter = value.trim().toLocaleLowerCase();
  // }

  //filter pros based on search bar input.
  public applyFilter(value: Event): void {
    const filterValue = (value.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
