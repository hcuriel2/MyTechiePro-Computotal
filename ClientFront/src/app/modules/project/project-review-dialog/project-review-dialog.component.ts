import { Component, OnInit } from '@angular/core'; 
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-project-review-dialog',
  templateUrl: './project-review-dialog.component.html',
  styleUrls: ['./project-review-dialog.component.scss'],
})
export class ProjectReviewDialogComponent implements OnInit {
  private readonly API_URL: string;
  reviewForm: FormGroup;
  hoverState = 0; 
  clickedState = 0;
  projectID: string; 
  successMessage: string = ''; 
  errorMessage: string = '';
  private messages: any = {};

  constructor(
    public dialogRef: MatDialogRef<ProjectReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectID: string },
    private http: HttpClient
  ) {
    this.API_URL = `${environment.apiEndpoint}/projects`;
  }

  ngOnInit(): void {
    this.projectID = this.data.projectID;
    this.http.get('/assets/i18n/en-us.json').subscribe((data) => {
      this.messages = data;
    });

    this.reviewForm = new FormGroup({
      review: new FormControl('', Validators.required),
      rating: new FormControl(0, [
        Validators.required,
        Validators.min(1),
        Validators.max(5),
      ]),
      projectID: new FormControl(this.projectID, Validators.required),
    });
  }

  onRate(rating: number): void {
    this.reviewForm.controls['rating'].setValue(rating);
  }

  hoveredOver(rate: number): void {
    this.hoverState = rate;
  }

  hoveredLeave(): void {
    this.hoverState = 0;
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) {
      if (this.messages?.Message?.ReviewRequired) {
        this.errorMessage = this.messages.Message.ReviewRequired;
      }
      this.successMessage = '';
      return;
    }

    const data = this.reviewForm.value;

    fetch(`${this.API_URL}/projectReview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(() => {
        if (this.messages?.Message?.ReviewSubmitSuccess) {
          this.successMessage = this.messages.Message.ReviewSubmitSuccess;
        }
        this.errorMessage = '';
        this.reviewForm.reset();

        setTimeout(() => {
          this.dialogRef.close(data);
        }, 2000);
      })
      .catch(() => {
        if (this.messages?.Message?.ReviewSubmitFailure) {
          this.errorMessage = this.messages.Message.ReviewSubmitFailure;
        }
        this.successMessage = ''; 
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
