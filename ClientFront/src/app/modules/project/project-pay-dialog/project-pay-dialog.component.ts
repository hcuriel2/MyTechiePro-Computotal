import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-project-pay-dialog',
    templateUrl: './project-pay-dialog.component.html',
    styleUrls: ['./project-pay-dialog.component.scss'],
})
export class ProjectPayDialogComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<ProjectPayDialogComponent>) {}

    public ngOnInit(): void {}

    public onSubmit(): void {
        this.dialogRef.close(true);
    }
    public onCancel(): void {
        this.dialogRef.close(false);
    }
}
