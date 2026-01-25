import { Injectable, signal } from '@angular/core';
import { UserRole } from '../core/models';
import { RoleService } from '../core/role.service';
import { UserService } from '../core/user.service';
import { Observable } from 'rxjs';
import { UserProfile } from '../core/models';

@Injectable({ providedIn: 'root' })
export class UsersController {
  readonly users$: Observable<UserProfile[]>;
  readonly roles: UserRole[];
  readonly errorMessage = signal<string | null>(null);

  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService
  ) {
    this.users$ = this.userService.users$;
    this.roles = this.roleService.roles.map(role => role.value);
  }

  async updateRoles(userId: string, roles: UserRole[]): Promise<void> {
    try {
      this.errorMessage.set(null);
      await this.userService.updateRoles(userId, roles);
    } catch (error) {
      console.error(error);
      this.errorMessage.set('Unable to update roles.');
    }
  }
}
