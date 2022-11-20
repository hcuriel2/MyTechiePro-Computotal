import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPassword } from 'src/app/shared/models/resetPassword';
import { UserService } from 'src/app/shared/services/user.service';
import { passwordValidator } from '../sign-up/password.directive';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  public formGroup: FormGroup;
  public password: FormControl;
  public confirmPassword: FormControl;
  public userId: string;
  public isFailed: boolean;
  constructor(private route: ActivatedRoute,
     private formBuilder: FormBuilder, 
     private userService: UserService,
     private router: Router) { }

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
    this.isFailed = false;
  }

  public onSubmit(): void {
    const newPassword: ResetPassword = new ResetPassword(this.password.value, 
          this.confirmPassword.value);
    this.userService.resetPassword(newPassword, this.userId).pipe()
    .subscribe(
        () => {
            this.isFailed = false;
            this.router.navigateByUrl('/').then(() => {
              window.location.reload();
              });   
        },
        (error) => {
          this.isFailed = true;
        }
    );
  }

}
