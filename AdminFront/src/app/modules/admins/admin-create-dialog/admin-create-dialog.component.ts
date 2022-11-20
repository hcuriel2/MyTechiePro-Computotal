import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-create-dialog',
  templateUrl: './admin-create-dialog.component.html',
  styleUrls: ['./admin-create-dialog.component.scss']
})
export class AdminCreateDialogComponent implements OnInit {
  public firstName: FormControl;
  public lastName: FormControl;
  public email: FormControl;
  public password: FormControl;
  public phoneNumber: FormControl;
  public formGroup: FormGroup;
  public data: any;

  constructor(
      public dialogRef: MatDialogRef<AdminCreateDialogComponent>,
      public formBuilder: FormBuilder

  ) {
      this.data = {
          firstName: undefined,
          lastName: undefined,
          email: undefined,
          password: undefined,
          phoneNumber: undefined
      };
  }

  public ngOnInit(): void {
      this.firstName = new FormControl(null, Validators.required);
      this.lastName = new FormControl(null, Validators.required);
      this.email = new FormControl(null, Validators.email);
      this.password = new FormControl(null, Validators.required);
      this.phoneNumber = new FormControl(null, Validators.required);

      this.formGroup = this.formBuilder.group({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        phoneNumber: this.phoneNumber
    });

  }

  public onSubmit(): void {
      this.data.email = this.email.value;
      this.data.firstName = this.firstName.value;
      this.data.lastName = this.lastName.value;
      this.data.password = this.password.value;
      this.data.phoneNumber = this.phoneNumber.value;
      
      this.dialogRef.close(this.data);
      
  }
  public onCancel(): void {
      this.dialogRef.close();
  }
}
