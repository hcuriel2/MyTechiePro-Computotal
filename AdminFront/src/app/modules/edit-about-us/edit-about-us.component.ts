import { Component, OnInit } from '@angular/core';
import { AboutUsService } from '../../shared/services/about-us.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-about-us',
  templateUrl: './edit-about-us.component.html',
  styleUrls: ['./edit-about-us.component.scss'],
})
export class EditAboutUsComponent implements OnInit {
  public aboutUsContent: string = '';
  public isEditing: boolean = false;
  public isSaving: boolean = false;
  public statusMessage: string = '';

  constructor(
    private aboutUsService: AboutUsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchAboutUsContent();
  }

  private fetchAboutUsContent(): void {
    this.statusMessage = 'Loading About Us text…';
    this.aboutUsService.getAboutUsContent().subscribe({
      next: (response: { content: string } | null) => {
        this.aboutUsContent = response && response.content ? response.content : '';
        this.statusMessage = '';
      },
      error: () => {
        this.statusMessage = 'Could not load About Us text. Retry before editing.';
      },
    });
  }

  public toggleEdit(): void {
    if (!this.isEditing) {
      this.isEditing = true;
      this.statusMessage = '';
      return;
    }

    if (this.isSaving) {
      return;
    }

    const content = (this.aboutUsContent || '').trim();
    if (content.length > 5000) {
      this.statusMessage = 'About Us text must be 5000 characters or fewer.';
      return;
    }

    this.isSaving = true;
    this.aboutUsService.updateAboutUsContent({ content }).subscribe({
      next: (response) => {
        this.aboutUsContent = response && response.content ? response.content : content;
        this.isEditing = false;
        this.isSaving = false;
        this.statusMessage = 'About Us text saved. It now appears on the client home page.';
        this.snackBar.open('About Us content updated successfully', 'Close', {
          duration: 3000,
        });
      },
      error: (error: any) => {
        this.isSaving = false;
        this.statusMessage =
          error && (error.status === 401 || error.status === 403)
            ? 'An authenticated Admin session is required to save.'
            : 'About Us text was not saved. Please retry.';
        this.snackBar.open('Failed to update About Us content', 'Close', {
          duration: 3000,
        });
      },
    });
  }
}
