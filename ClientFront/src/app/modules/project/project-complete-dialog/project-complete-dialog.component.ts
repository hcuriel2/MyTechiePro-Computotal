import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-project-complete-dialog',
    templateUrl: './project-complete-dialog.component.html',
    styleUrls: ['./project-complete-dialog.component.scss'],
})
export class ProjectCompleteDialogComponent implements OnInit {
    public eTransferEmail: FormControl;
    public formGroup: FormGroup;
    public startDate: FormControl;
    public endDate: FormControl;
    public price: FormControl;
    public data: any;

    constructor(
        public dialogRef: MatDialogRef<ProjectCompleteDialogComponent>,
        public formBuilder: FormBuilder
    ) {
        this.data = {
            startDate: undefined,
            endDate: undefined,
            totalCost: undefined,
            email: undefined
            // projectDetail: undefined,
        };

    }

    public ngOnInit(): void {
        this.eTransferEmail = new FormControl(null, Validators.email);
        this.startDate = new FormControl(null, Validators.required);
        this.endDate = new FormControl(null, Validators.required);
        this.price = new FormControl(null, Validators.required);

        
        this.formGroup = this.formBuilder.group({
            startDate: this.startDate,
            endDate: this.endDate,
            price: this.price,
            email: this.eTransferEmail
        });

    }

    public onSubmit(): void {
        this.data.startDate = this.startDate.value;
        this.data.endDate = this.endDate.value;
        
        

        this.data.totalCost = this.price.value;
        this.data.email = this.eTransferEmail.value
        this.dialogRef.close(this.data);
        
    }
    public onCancel(): void {
        this.dialogRef.close();
    }
}
