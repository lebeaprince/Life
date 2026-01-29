import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of, shareReplay, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserProfile, UserRole } from './models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  readonly users$ = this.authService.profile$.pipe(
    switchMap((profile) => {
      if (!profile) {
        return of([] as UserProfile[]);
      }
      return this.http.get<UserProfile[]>(`${environment.apiBaseUrl}/users`);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  async updateRoles(userId: string, roles: UserRole[]): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${environment.apiBaseUrl}/users/${userId}/roles`, { roles })
    );
  }

  async updateDisplayName(userId: string, displayName: string): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${environment.apiBaseUrl}/users/${userId}/display-name`, { displayName })
    );
  }
}
