import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { AdminAccessService, AdminRole } from './services/admin-access.service';

@Injectable({
  providedIn: 'root',
})
export class AdminRoleGuard implements CanActivate {
  constructor(
    private adminAccessService: AdminAccessService,
    private router: Router
  ) {}

  public canActivate(): Observable<boolean | UrlTree> {
    return this.adminAccessService.adminRole$.pipe(
      filter((role): role is AdminRole => role !== null),
      take(1),
      map((role) => role === 'Admin' || this.router.parseUrl('/edit-about-us'))
    );
  }
}
