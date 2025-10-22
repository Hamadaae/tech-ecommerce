import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { mergeMap, map, catchError, tap, switchMap, filter } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { AuthService, AuthResponse } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffect {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {}

  // 🔹 تسجيل الدخول
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((response: AuthResponse) =>
            AuthActions.loginSuccess({
              user: response.user,
              token: response.token,
            })
          ),
          catchError((error) =>
            of(
              AuthActions.loginFailure({
                error: error.message || 'Login failed',
              })
            )
          )
        )
      )
    )
  );

  // 🔹 عند نجاح تسجيل الدخول → توجيه حسب نوع المستخدم
  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user, token }) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          // ✅ توجيه حسب الدور
          if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        })
      ),
    { dispatch: false }
  );

  // 🔹 تحميل المستخدم من localStorage عند بداية التطبيق
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType('@ngrx/store/init', '@ngrx/effects/init'),
      map(() => AuthActions.loadUserFromStorage())
    )
  );

  loadUserFromStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserFromStorage),
      filter(() => !!localStorage.getItem('token')),
      switchMap(() =>
        this.authService.getMe().pipe(
          map((user) =>
            AuthActions.loginSuccess({
              user,
              token: localStorage.getItem('token')!,
            })
          ),
          catchError(() => of(AuthActions.logout()))
        )
      )
    )
  );

  // 🔹 تسجيل الخروج
  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );

  // 🔹 التسجيل (Register)
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap(({ data }) =>
        this.authService.register(data).pipe(
          map((response: AuthResponse) =>
            AuthActions.registerSuccess({
              user: response.user,
              token: response.token,
            })
          ),
          catchError((error: any) =>
            of(
              AuthActions.registerFailure({
                error: error.error?.message || error.message || 'Registration failed',
              })
            )
          )
        )
      )
    )
  );

  // 🔹 عند نجاح التسجيل → توجيه حسب نوع المستخدم
  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(({ user, token }) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          // ✅ توجيه حسب الدور
          if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        })
      ),
    { dispatch: false }
  );
}
