import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const isPublicAuthRequest =
    req.url.includes('/auth/login') || req.url.includes('/auth/register');

  if (token && !req.headers.has('Authorization') && !isPublicAuthRequest) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  const authHeader = req.headers.get('Authorization');
  const requestToken =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : null;

  return next(req).pipe(
    catchError((error) => {
      if (error?.status === 401 && !isPublicAuthRequest) {
        const currentToken = authService.getToken();
        const shouldSignOut =
          (requestToken && currentToken === requestToken) ||
          (!requestToken && !currentToken);
        if (shouldSignOut) {
          void authService.signOut();
          void router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
