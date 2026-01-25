import { Injectable, signal } from '@angular/core';
import { UserRole } from '../core/models';
import { RoleService } from '../core/role.service';
import { UserService } from '../core/user.service';

@Injectable({ providedIn: 'root' })
export class UsersController {
  readonly users$ = this.userService.users$;
  readonly roles = this.roleService.roles;
  readonly errorMessage = signal<string | null>(null);

  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService
  ) {}

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
