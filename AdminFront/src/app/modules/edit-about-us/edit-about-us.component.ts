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
  public appendixContent: string = '';
  public editingSection: 'whoWeAre' | 'appendix' | null = null;
  public isSaving: boolean = false;
  private originalContent: string = '';

  constructor(
    private aboutUsService: AboutUsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchAboutUsContent();
  }

  private fetchAboutUsContent(): void {
    this.aboutUsService.getAboutUsContent().subscribe({
      next: (response) => {
        this.aboutUsContent = response && response.content ? response.content : '';
        this.appendixContent = response && response.appendixContent
          ? response.appendixContent
          : '';
      },
      error: (error: any) => {
        console.error('Failed to fetch About Us content:', error);
      },
    });
  }

  public startEditing(section: 'whoWeAre' | 'appendix'): void {
    this.editingSection = section;
    this.originalContent = this.getSectionContent(section);
  }

  public cancelEditing(section: 'whoWeAre' | 'appendix'): void {
    this.setSectionContent(section, this.originalContent);
    this.editingSection = null;
  }

  public saveSection(section: 'whoWeAre' | 'appendix'): void {
    const update = section === 'whoWeAre'
      ? { content: this.aboutUsContent }
      : { appendixContent: this.appendixContent };

    this.isSaving = true;
    this.aboutUsService.updateAboutUsContent(update).subscribe({
      next: () => {
        this.editingSection = null;
        this.isSaving = false;
        this.snackBar.open(
          `${section === 'whoWeAre' ? 'Who We Are' : 'Appendix'} content updated successfully`,
          'Close',
          { duration: 3000 }
        );
      },
      error: (error: any) => {
        console.error('Failed to update page content:', error);
        this.isSaving = false;
        this.snackBar.open('Failed to update page content', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  private getSectionContent(section: 'whoWeAre' | 'appendix'): string {
    return section === 'whoWeAre' ? this.aboutUsContent : this.appendixContent;
  }

  private setSectionContent(section: 'whoWeAre' | 'appendix', content: string): void {
    if (section === 'whoWeAre') {
      this.aboutUsContent = content;
    } else {
      this.appendixContent = content;
    }
  }
}
