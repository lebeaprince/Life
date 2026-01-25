import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { AuthService } from './auth.service';
import { UserRole } from './models';

@Injectable({ providedIn: 'root' })
export class RoleService {
  readonly roles: { value: UserRole; label: string }[] = [
    { value: 'owner', label: 'Owner' },
    { value: 'manager', label: 'Manager' },
    { value: 'cashier', label: 'Cashier' }
  ];

  readonly canManageUsers$ = this.createCanManageUsers();

  constructor(private readonly authService: AuthService) {}

  private createCanManageUsers() {
    return this.authService.profile$.pipe(
      map((profile) => {
        if (!profile) {
          return false;
        }
        return profile.roles.includes('owner') || profile.roles.includes('manager');
      })
    );
  }
}
