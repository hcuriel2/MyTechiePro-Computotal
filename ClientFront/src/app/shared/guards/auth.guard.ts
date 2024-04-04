import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
    ) {}

  canActivate(): boolean {
    if (!this.authService.userValue) {
        if (this.authService.isSessionChecked) {
            this.router.navigate(['/'])
        }
        this.authService.initSessionCheck();
        return false;
    }
    return true;
  }
}
