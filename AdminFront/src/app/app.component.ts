import { BreakpointObserver } from '@angular/cdk/layout';
import { ViewChild } from '@angular/core';
import { Component } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  constructor(private observer: BreakpointObserver) { }

  ngAfterViewInit() {
  //gets cookie from browser and uses it to access user details
    let userCookie = getCookie("user");
    
    if (!userCookie || JSON.parse(JSON.parse(userCookie)).userType != "Admin") {
      // window.location.href = "https://mytechie.pro";
    } else {
      console.log(userCookie);
      console.log(JSON.parse(userCookie));
      let json = JSON.parse(userCookie);
      let user = JSON.parse(json);
      console.log(user);
      let firstName = user.firstName;
      let lastName = user.lastName;
      let fullName = firstName + " " + lastName;
      console.log(firstName);
      // Assigns name displayed on the admin page to the name based on the user cookie.
      document.getElementById("fullName")!.innerHTML = fullName;

      this.observer.observe(['(max-width: 800px)']).subscribe((res) => {
        if (res.matches) {
          this.sidenav.mode = 'over';
          this.sidenav.close();
        } else {
          this.sidenav.mode = 'side';
          this.sidenav.open();
        }
      });
    }
  }

  public signOut() {
    localStorage.removeItem('user');
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.mytechie.pro;";
    window.location.reload();
  }
}

/**
 * Gets the cookie by the cookie name and formats it as a cookie string.
 * @param cname 
 * @returns 
 */
function getCookie(cname: string) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
