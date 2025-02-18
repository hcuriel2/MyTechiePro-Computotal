import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-project-reset-price-dialog',
  templateUrl: './project-reset-price-dialog.component.html',
  styleUrls: ['./project-reset-price-dialog.component.scss']
})
export class ProjectResetPriceDialogComponent implements OnInit {
  formGroup: FormGroup;
  newPrice: FormControl;

  constructor(
    private dialogRef: MatDialogRef<ProjectResetPriceDialogComponent>
  ) {}

  ngOnInit(): void {
    this.newPrice = new FormControl(null, [Validators.required, Validators.min(0)]);
    this.formGroup = new FormGroup({
      newPrice: this.newPrice
    });
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
        const price = parseFloat(this.newPrice.value);
        this.dialogRef.close({ totalCost: price });
    }
 }

  onCancel(): void {
    this.dialogRef.close();
  }
}