import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AdminRole = 'Admin' | 'Editor' | 'Read-only';

@Injectable({
  providedIn: 'root',
})
export class AdminAccessService {
  private readonly adminRoleSubject = new BehaviorSubject<AdminRole | null>(null);
  public readonly adminRole$: Observable<AdminRole | null> = this.adminRoleSubject.asObservable();

  public setAdminRole(role: AdminRole): void {
    this.adminRoleSubject.next(role);
  }
}
