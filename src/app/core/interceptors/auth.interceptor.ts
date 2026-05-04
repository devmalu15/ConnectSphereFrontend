import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, of } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const token = auth.token();
  
  const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  
  return next(cloned).pipe(
    catchError(err => {
      if (err.status === 401 && token) {
        return auth.refreshToken().pipe(
          switchMap(res => {
            const token = res.accessToken || res.token;
            const retried = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
            return next(retried);
          }),
          catchError(() => { auth.logout(); return throwError(() => err); })
        );
      }
      return throwError(() => err);
    })
  );
};
