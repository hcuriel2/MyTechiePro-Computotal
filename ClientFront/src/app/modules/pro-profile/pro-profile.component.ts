import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pro-profile',
  templateUrl: './pro-profile.component.html',
  styleUrls: ['./pro-profile.component.scss']
})
export class ProProfileComponent implements OnInit {
  userProfile: any;
  availableColors = [
    'rgb(1, 38, 81)',
    'rgb(16, 63, 116)',
    'rgb(28, 72, 121)',
    'rgb(38, 85, 138)',
    'rgb(60, 103, 151)',
    'rgb(59, 120, 188)',
    'rgb(74, 130, 194)'
  ];

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    const userProfileString = localStorage.getItem('user');
    if (userProfileString && userProfileString !== '{}') {
      this.userProfile = JSON.parse(userProfileString);
    } else {
      
    }
  }

  getSkillColor(index: number): string {
    return this.availableColors[index % this.availableColors.length];
  }
}
