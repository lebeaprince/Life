import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  query,
  updateDoc,
  where
} from '@angular/fire/firestore';
import { map, of, shareReplay, switchMap } from 'rxjs';
import { UserProfile, UserRole } from './models';
import { TenantContextService } from './tenant-context.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly firestore = inject(Firestore);
  private readonly tenantContext = inject(TenantContextService);

  readonly users$ = this.tenantContext.tenantId$.pipe(
    switchMap((tenantId) => {
      if (!tenantId) {
        return of([] as UserProfile[]);
      }

      const usersRef = collection(this.firestore, 'users');
      const usersQuery = query(usersRef, where('tenantId', '==', tenantId));
      return collectionData(usersQuery, { idField: 'uid' }).pipe(
        map((data) => data as UserProfile[])
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  async updateRoles(userId: string, roles: UserRole[]): Promise<void> {
    const userRef = doc(this.firestore, `users/${userId}`);
    await updateDoc(userRef, { roles });
  }

  async updateDisplayName(userId: string, displayName: string): Promise<void> {
    const userRef = doc(this.firestore, `users/${userId}`);
    await updateDoc(userRef, { displayName });
  }
}
