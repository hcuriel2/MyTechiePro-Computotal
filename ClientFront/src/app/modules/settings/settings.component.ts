
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { User } from 'src/app/shared/models/user';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  public formDisabled = true; 
  public editing = false;
  public userId = '';
  public settingsForm: FormGroup;
  public successMessage: string = '';
  private originalUserData: User | null = null; 
  private editSnapshot: any = null; 

  constructor(
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      firstName: [{ value: '', disabled: true }, Validators.required],
      lastName: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      street: [{ value: '', disabled: true }],
      city: [{ value: '', disabled: true }],
      country: [{ value: '', disabled: true }],
      postalCode: [{ value: '', disabled: true }],
    });

    this.authService.user.subscribe((user) => {
      if (user) {
        this.originalUserData = user;
        this.userId = user._id;
        this.populateForm(user);
      }
    });
  }

  private populateForm(user: User): void {
    this.settingsForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      street: user.address?.street || '',
      city: user.address?.city || '',
      country: user.address?.country || '',
      postalCode: user.address?.postalCode || '',
    });
  }

  enableForm(): void {
    this.formDisabled = false;
    this.editing = true;

    Object.keys(this.settingsForm.controls).forEach((key) => {
      this.settingsForm.get(key)?.enable();
    });

    this.editSnapshot = { ...this.settingsForm.value };
    this.changeDetectorRef.detectChanges();
  }

  cancelEdit(): void {
    if (this.editSnapshot) {
      this.settingsForm.patchValue(this.editSnapshot);
    }
    this.formDisabled = true;
    this.editing = false;

    Object.keys(this.settingsForm.controls).forEach((key) => {
      this.settingsForm.get(key)?.disable();
    });

    this.changeDetectorRef.detectChanges();
  }

  submitForm(): void {
    if (this.settingsForm.valid) {
      const updatedUserInfo = this.settingsForm.value;

      this.authService.updateUserSettings(this.userId, updatedUserInfo).subscribe({
        next: (response) => {
          this.originalUserData = { ...this.originalUserData, ...updatedUserInfo };
          this.formDisabled = true;
          this.editing = false;

          Object.keys(this.settingsForm.controls).forEach((key) => {
            this.settingsForm.get(key)?.disable();
          });

          this.successMessage = 'Profile info saved successfully!';
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Error updating user info:', error);
        },
      });
    } else {
      console.error('Form is invalid.');
    }
  }
}
