import { BreakpointObserver } from '@angular/cdk/layout';
import { ViewChild } from '@angular/core';
import { Component } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  constructor(private observer: BreakpointObserver,
    private http: HttpClient
  ) { }

  ngAfterViewInit() {
    this.http.get<any>(`${environment.apiEndpoint}/auth/checkSession`, { withCredentials: true })
      .subscribe({
        next: (user) => {
          if (user.userType !== 'Admin') {
            console.log(user);
            window.location.href = environment.clientUrl;
            return;
          }
          document.getElementById("fullName")!.innerHTML = 
            `${user.firstName} ${user.lastName}`;
          
          const avatar = document.getElementById("userAvatar");
          if (avatar) {
            avatar.setAttribute('src', `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=edf2fa`);
          }
  
          this.observer.observe(['(max-width: 800px)']).subscribe((res) => {
            if (res.matches) {
              this.sidenav.mode = 'over';
              this.sidenav.close();
            } else {
              this.sidenav.mode = 'side';
              this.sidenav.open();
            }
          });
        },
        error: () => {
          console.log("error");
          window.location.href = environment.clientUrl;
        }
      });
  }

  public signOut() {
    this.http.post(`${environment.apiEndpoint}/auth/logout`, {}, { 
      withCredentials: true,
      observe: 'response'
    }).subscribe({
      next: (response) => {
        console.log('Logout successful');
        window.location.href = environment.clientUrl;
      },
      error: (error) => {
        console.error('Logout failed:', error);
        window.location.href = environment.clientUrl;
      }
    });
  }
}

