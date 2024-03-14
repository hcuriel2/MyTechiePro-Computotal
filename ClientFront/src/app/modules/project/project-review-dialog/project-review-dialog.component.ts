import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-project-review-dialog',
  templateUrl: './project-review-dialog.component.html',
  styleUrls: ['./project-review-dialog.component.scss'],
})
export class ProjectReviewDialogComponent implements OnInit {
  reviewForm: FormGroup;
  hoverState = 0; // Set the initial star rating to 0
  clickedState = 0;
  projectID: string; // Project ID

  constructor(public dialogRef: MatDialogRef<ProjectReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectID: string }) {}

  ngOnInit(): void {
    this.projectID = this.data.projectID;

    this.reviewForm = new FormGroup({
      review: new FormControl('', Validators.required),
      rating: new FormControl(0, [Validators.required, Validators.min(1), Validators.max(5)]),
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
    if (this.reviewForm.valid) {
      const data = this.reviewForm.value;
      console.log(data);
      const url = 'http://localhost:3333/auth/reviews';

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
        
      })
      .then(data => {
        console.log('Response: ', data);
        this.dialogRef.close(this.reviewForm.value);
      })
      .catch(error => {
        console.error('API Error: ', error);
      })
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }



}
