import { BreakpointObserver } from '@angular/cdk/layout';
import { ViewChild } from '@angular/core';
import { Component } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AdminAccessService, AdminRole } from './shared/services/admin-access.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  public adminRole: AdminRole = 'Read-only';

  constructor(private observer: BreakpointObserver,
    private http: HttpClient,
    private router: Router,
    private adminAccessService: AdminAccessService
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
          this.adminRole = user.adminRole || 'Admin';
          this.adminAccessService.setAdminRole(this.adminRole);
          if (this.adminRole !== 'Admin' && this.router.url !== '/edit-about-us') {
            this.router.navigateByUrl('/edit-about-us');
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
        window.location.href = environment.clientUrl
        setTimeout(() => {
          window.location.href = environment.clientUrl;
        }, 500); // adding short delay to ensure the logout request completes
      },
      error: (error) => {
        console.error('Logout failed:', error);
        setTimeout(() => {
          window.location.href = environment.clientUrl;
        }, 500); 
      }
    });
  }
}
