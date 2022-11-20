import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormBuilder,
    Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-project-start-dialog',
    templateUrl: './project-start-dialog.component.html',
    styleUrls: ['./project-start-dialog.component.scss'],
})
export class ProjectStartDialogComponent implements OnInit {
    // public startDate: FormControl;
    // public endDate: FormControl;
    public price: FormControl;
    public detailText: FormControl;
    public formGroup: FormGroup;
    public data: any;

    constructor(
        public dialogRef: MatDialogRef<ProjectStartDialogComponent>,
        public formBuilder: FormBuilder,
        private router: Router
    ) {
        this.data = {
            // startDate: undefined,
            // endDate: undefined,
            totalCost: undefined,
            projectDetail: undefined,
        };
    }

    public ngOnInit(): void {
        // this.startDate = new FormControl(null, Validators.required);
        // this.endDate = new FormControl(null, Validators.required);
        this.price = new FormControl(null, Validators.required);
        this.detailText = new FormControl(null);

        this.formGroup = this.formBuilder.group({
            // startDate: this.startDate,
            // endDate: this.endDate,
            price: this.price,
            detailText: this.detailText,
        });
    }

    public onSubmit(): void {
        // console.log(this.startDate.value);
        // console.log(this.endDate.value);
        console.log(this.price.value);
        console.log(this.detailText.value);
        this.data.totalCost = this.price.value;
        this.data.projectDetail = this.detailText.value;

        this.dialogRef.close(this.data);
        //window.location.reload();
    }

    public onCancel(): void {
        this.dialogRef.close();
    }
}
