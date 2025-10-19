import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        // Global 401 handling: redirect to login
        if (err.status === 401) {
          localStorage.removeItem('token');
          this.router.navigate(['/auth/login']);
        }

        // You could also surface readable messages here
        const error = err.error?.message || err.statusText || 'Server error';
        return throwError(() => new Error(error));
      })
    );
  }
}
