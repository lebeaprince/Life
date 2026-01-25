import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, collection, doc, docData, serverTimestamp, setDoc } from '@angular/fire/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { map, of, shareReplay, switchMap } from 'rxjs';
import { UserProfile, UserRole } from './models';

export interface SignUpPayload {
  email: string;
  password: string;
  displayName: string;
  tenantName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);

  readonly user$ = authState(this.auth);
  readonly profile$ = this.user$.pipe(
    switchMap((user) => {
      if (!user) {
        return of(null);
      }

      const userRef = doc(this.firestore, `users/${user.uid}`);
      return docData(userRef).pipe(
        map((data) => {
          if (!data) {
            return null;
          }
          return {
            ...(data as Omit<UserProfile, 'uid'>),
            uid: user.uid
          };
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  async signIn(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async signUp(payload: SignUpPayload): Promise<void> {
    const { email, password, displayName, tenantName } = payload;
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);

    await updateProfile(credential.user, { displayName });

    const tenantRef = doc(collection(this.firestore, 'tenants'));
    const userRef = doc(this.firestore, `users/${credential.user.uid}`);
    const roles: UserRole[] = ['owner'];

    await setDoc(tenantRef, {
      name: tenantName,
      plan: 'starter',
      ownerUid: credential.user.uid,
      createdAt: serverTimestamp()
    });

    await setDoc(userRef, {
      email,
      displayName,
      tenantId: tenantRef.id,
      roles,
      createdAt: serverTimestamp()
    });
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }
}
