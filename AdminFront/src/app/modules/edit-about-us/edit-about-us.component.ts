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
  // Blocks a second Save click while the first request is still going out.
  public isSaving: boolean = false;
  // Short note under the title: loading, saved, or why the save failed.
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
        // Same guard as the client page: don't assume the body always has content.
        this.aboutUsContent = response && response.content ? response.content : '';
        this.statusMessage = '';
      },
      error: () => {
        this.statusMessage = 'Could not load About Us text. Retry before editing.';
      },
    });
  }

  // First click unlocks the box. The next click is the save.
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
    // The textarea also has maxlength="5000". This catches anything that slips past it.
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
        // 401/403 means the admin cookie is missing or the account is not an Admin.
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
