import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { ClientRequest } from 'src/app/shared/models/contact-us';
import { ContactUsService } from 'src/app/shared/services/contact-us.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ContactUsDialogComponent } from './contact-us-dialog/contact-us-dialog/contact-us-dialog.component';
import { DataService } from 'src/app/shared/services/data.service';

@Component({
    selector: 'app-contact-us',
    templateUrl: './contact-us.component.html',
    styleUrls: ['./contact-us.component.scss'],
})
export class ContactUsComponent implements OnInit {
    public formGroup!: FormGroup;
    public firstName!: FormControl;
    public lastName!: FormControl;
    public emailAddress!: FormControl;
    public message!: FormControl;
    public confirmationMessage: string;
    public isSubmitted: boolean = false;

    constructor(
        private formBuilder: FormBuilder,
        private changeDetectorRef: ChangeDetectorRef,
        private contactService: ContactUsService,
        private dialog: MatDialog,
        // use to pass data between two unrelated components
        private data: DataService
    ) { }

    public ngOnInit(): void {
        this.createForm();
        // on init we want this component to listen to this string in data service
        // which we will be using later to set up our confirmation message
        // in ContactUsDialogComponent
        this.data.currentMessage.subscribe(message => this.confirmationMessage = message);
    }

    // on submitting a contactus request, this function grabs all data from the form
    // check email against a regex, it will also show in red in the form if email is not valid
    // if email is valid it will post to mongo and give a thank you message
    // if email is not valid it will give a enter valid email address message
    public onSubmit(): void {
        
        // contact us confirmation logic
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;

        let clientRequest: ClientRequest = new ClientRequest();
        clientRequest.firstName = this.firstName.value;
        clientRequest.lastName = this.lastName.value;
        clientRequest.email = this.emailAddress.value!;
        clientRequest.message = this.message.value;

        // our email regex
        var regexTester = new RegExp("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}");

        if (regexTester.test(this.emailAddress.value)) {
            this.contactService.sendContactInfo(clientRequest).subscribe(
                (clientRequest: ClientRequest) => {
                    this.newMessage("Submitted successfully")
                    this.dialog
                        .open(ContactUsDialogComponent, dialogConfig)
                        .afterClosed().subscribe(() => {
                            this.formGroup.disable();
                            this.isSubmitted = true;
                        })
                }
            );
        } else {
            this.newMessage("Please input valid email address")
            this.dialog
                .open(ContactUsDialogComponent, dialogConfig)
                .afterClosed()
        }
    }

    // helper function to change the message of the confirmation dialog
    newMessage(message: string) {
        this.data.changeMessage(message);
    }

    private createForm(): void {
        this.firstName = new FormControl(null, Validators.required);
        this.lastName = new FormControl(null, Validators.required);
        this.emailAddress = new FormControl(null, [
            Validators.required,
            Validators.email,
        ]);
        this.message = new FormControl(null, Validators.required);

        this.formGroup = this.formBuilder.group({
            firstName: this.firstName,
            lastName: this.lastName,
            emailAddress: this.emailAddress,
            message: this.message,
        });

        this.changeDetectorRef.markForCheck();
    }
}
