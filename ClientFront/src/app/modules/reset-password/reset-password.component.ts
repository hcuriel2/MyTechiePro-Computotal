import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ResetPassword } from 'src/app/shared/models/resetPassword';
import { UserService } from 'src/app/shared/services/user.service';
import { passwordValidator } from '../sign-up/password.directive';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  public formGroup: FormGroup;
  public password: FormControl;
  public confirmPassword: FormControl;
  public userId: string;
  public isFailed: boolean;
  public resetToken: string = '';
  public isSaving: boolean = false;
  private cleanup = new Subscription();
  constructor(private route: ActivatedRoute,
     private formBuilder: FormBuilder, 
     private userService: UserService,
     private router: Router,
     private location: Location) { }

  ngOnInit(): void {
    this.password = new FormControl(null, [Validators.required,
      Validators.minLength(8),
      Validators.maxLength(16),
      Validators.pattern("^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$")
  ]);
    this.confirmPassword = new FormControl(null, [
        Validators.required,
        passwordValidator,
    ]);

    this.formGroup = this.formBuilder.group({
      password: this.password,
      confirmPassword: this.confirmPassword
  });
    this.userId = this.route.snapshot.params["id"];
    // Fragment credentials are not sent in request URLs or referrer headers.
    this.isFailed = false;
    // Angular can reuse this component when a new link changes only the fragment.
    this.cleanup.add(this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => this.clearCredentialFromAddress()));
    this.cleanup.add(this.route.fragment.subscribe(fragment => {
      const token = new URLSearchParams(fragment || '').get('token');
      if (token) {
        this.resetToken = token;
        this.isFailed = false;
        this.clearCredentialFromAddress();
      }
    }));
  }

  ngOnDestroy(): void { this.cleanup.unsubscribe(); }

  private clearCredentialFromAddress(): void {
    if (this.resetToken) { this.location.replaceState(this.location.path(false)); }
  }

  public onSubmit(): void {
    if (!this.formGroup.valid || !this.resetToken || this.isSaving) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    const newPassword: ResetPassword = new ResetPassword(this.password.value, 
          this.confirmPassword.value, this.resetToken);
    this.userService.resetPassword(newPassword, this.userId).pipe()
    .subscribe(
        () => {
            this.isFailed = false;
            this.resetToken = '';
            this.router.navigateByUrl('/');
        },
        (error) => {
          this.isFailed = true;
          this.isSaving = false;
        }
    );
  }

}
