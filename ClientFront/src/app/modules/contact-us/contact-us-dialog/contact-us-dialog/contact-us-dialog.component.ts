import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/shared/services/data.service';

// this component is the confirmation dialog component when a user makes a contact us request
@Component({
  selector: 'app-contact-us-dialog',
  templateUrl: './contact-us-dialog.component.html',
  styleUrls: ['./contact-us-dialog.component.scss']
})
export class ContactUsDialogComponent implements OnInit {
  confirmationMessage: string;

  constructor(
    public dialogRef: MatDialogRef<ContactUsDialogComponent>,
    private data: DataService
  ) {
   }

  ngOnInit(): void {
    this.data.currentMessage.subscribe(message => this.confirmationMessage = message);
  }

  public onSubmit(): void {
    this.dialogRef.close();
  }
}
