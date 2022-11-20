import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ClientRequest } from 'src/app/shared/models/contact-us';
import { ContactUsService } from 'src/app/shared/services/contact-us.service';

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

    constructor(
        private formBuilder: FormBuilder,
        private changeDetectorRef: ChangeDetectorRef,
        private contactService: ContactUsService,
    ) {}

    public ngOnInit(): void {
        this.createForm();
    }

    public onSubmit(): void {
        console.log('onSubmit');
        let clientRequest: ClientRequest = new ClientRequest();
        clientRequest.firstName = this.firstName.value;
        clientRequest.lastName = this.lastName.value;
        clientRequest.email = this.emailAddress.value;
        clientRequest.message = this.message.value;

        this.contactService.sendContactInfo(clientRequest).subscribe(
            (clientRequest: ClientRequest) => {
                console.log(clientRequest);
            }
        );

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
