// Dialog box for Techie review. Client submits star rating as well as feedback comment.

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-project--dialog',
    templateUrl: './project-review-dialog.component.html',
    styleUrls: ['./project-review-dialog.component.scss'],
})
export class ProjectReviewDialogComponent implements OnInit {
    public clientComment: FormControl;
    public formGroup: FormGroup;

    starRating = 0;
    constructor(public dialogRef: MatDialogRef<ProjectReviewDialogComponent>) {}

    public ngOnInit(): void {
        this.clientComment = new FormControl(null, Validators.email);
        this.formGroup = new FormGroup({ Comment: this.clientComment });
    }

    public onSubmit(): void {
        console.log(this.starRating);
        console.log("Form comment is: " + this.clientComment.value);
        this.dialogRef.close(JSON.stringify({rating: this.starRating, comment: this.clientComment.value}));
    }
    public onCancel(): void {
        this.dialogRef.close(false);
    }
}