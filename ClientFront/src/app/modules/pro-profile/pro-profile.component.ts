import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pro-profile',
  templateUrl: './pro-profile.component.html',
  styleUrls: ['./pro-profile.component.scss']
})
export class ProProfileComponent implements OnInit {
  userProfile: any;

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    const userProfileString = localStorage.getItem('user');
    if (userProfileString && userProfileString !== '{}') {
      this.userProfile = JSON.parse(userProfileString);
    } else {
      console.log('No user profile information found in local storage.');
      // Handle the case where there is no user information (e.g., redirect to login page)
    }
  }

  usedHues: Set<number> = new Set();

  getRandomHSLColor(): string {
    let hue;
    let attempts = 0;
      do {
      hue = Math.floor(Math.random() * 300); 
      attempts++;
      if (attempts > 50) {
        console.warn("Too many attempts to find a unique hue.");
        break;
      }
    } while (this.usedHues.has(hue));
  
    this.usedHues.add(hue);
      return `hsl(${hue}, 100%, 20%)`;
  }
  


}
