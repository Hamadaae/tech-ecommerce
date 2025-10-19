import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, EMPTY } from 'rxjs';
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

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user, token }) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          this.router.navigate(['/']);
        })
      ),
    { dispatch: false }
  );

  // NEW EFFECT: Loads user data on app initialization if a token exists
  init$ = createEffect(() =>
    // Listen for the special NgRx 'INIT' action (dispatched once on app startup)
    this.actions$.pipe(
      ofType('@ngrx/store/init', '@ngrx/effects/init'),
      // First, attempt to load data from localStorage (this triggers the reducer)
      map(() => AuthActions.loadUserFromStorage())
    )
  );

  loadUserFromStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserFromStorage),
      // Check if a token was found by the reducer
      filter(() => !!localStorage.getItem('token')),
      // If token exists, call getMe to validate it and get fresh user data
      switchMap(() =>
        this.authService.getMe().pipe(
          map((user) => AuthActions.loginSuccess({ user, token: localStorage.getItem('token')! })),
          catchError(() => {
            // If getMe fails (token expired/invalid), log the user out
            return of(AuthActions.logout());
          })
        )
      )
    )
  );

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

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap(({ data }) =>
        this.authService.register(data).pipe(
          map((response: AuthResponse) =>
            AuthActions.registerSuccess({ user: response.user, token: response.token })
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
  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(({ user, token }) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          this.router.navigate(['/']);
        })
      ),
    { dispatch: false }
  );
}
