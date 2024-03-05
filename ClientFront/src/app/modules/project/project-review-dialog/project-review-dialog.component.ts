import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
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

  constructor(public dialogRef: MatDialogRef<ProjectReviewDialogComponent>) {}

  ngOnInit(): void {
    this.reviewForm = new FormGroup({
      comment: new FormControl('', Validators.required),
      rating: new FormControl(0, [Validators.required, Validators.min(1), Validators.max(5)]),
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
      this.dialogRef.close(this.reviewForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }



}
