import { Component, OnInit } from '@angular/core';
import { AboutUsService } from '../../shared/services/about-us.service';

@Component({
  selector: 'app-edit-about-us',
  templateUrl: './edit-about-us.component.html',
  styleUrls: ['./edit-about-us.component.scss'],
})
export class EditAboutUsComponent implements OnInit {
  public aboutUsContent: string = '';
  public isEditing: boolean = false;

  constructor(private aboutUsService: AboutUsService) {}

  ngOnInit(): void {
    this.fetchAboutUsContent();
  }

  private fetchAboutUsContent(): void {
    this.aboutUsService.getAboutUsContent().subscribe({
      next: (response: { content: string }) => {
        this.aboutUsContent = response.content;
      },
      error: (error: any) => {
        console.error('Failed to fetch About Us content:', error);
      },
    });
  }
  
  public toggleEdit(): void {
    if (this.isEditing) {
      this.aboutUsService.updateAboutUsContent({ content: this.aboutUsContent }).subscribe({
        next: () => {
          console.log('About Us content updated successfully');
          this.isEditing = false;
        },
        error: (error: any) => {
          console.error('Failed to update About Us content:', error);
        },
      });
    } else {
      this.isEditing = true;
    }
  }
}