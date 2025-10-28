import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, EMPTY, concat } from 'rxjs';
import { mergeMap, map, catchError, tap, switchMap } from 'rxjs/operators';
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

          if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        })
      ),
    { dispatch: false }
  );

  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType('@ngrx/store/init', '@ngrx/effects/init'),
      map(() => AuthActions.loadUserFromStorage())
    )
  );

  loadUserFromStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserFromStorage),
      switchMap(() => {
        const token = localStorage.getItem('token');
        if (!token) return EMPTY;

        const userStr = localStorage.getItem('user');
        const storedUser = userStr ? JSON.parse(userStr) : null;

        const restoreAction = AuthActions.loginSuccess({ user: storedUser, token });

        const refresh$ = this.authService.getMe().pipe(
          map((user) => AuthActions.loginSuccess({ user, token })),
          catchError(() => EMPTY)
        );

        return concat(of(restoreAction), refresh$);
      })
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

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(({ user, token }) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        })
      ),
    { dispatch: false }
  );
  

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateUser),
      mergeMap(({ userId, data }) =>
        this.authService.updateUser(userId, data).pipe(
          map((user) => AuthActions.updateUserSuccess({ user })),
          catchError((error) =>
            of(
              AuthActions.updateUserFailure({
                error: error.error?.message || error.message || 'Failed to update user profile.',
              })
            )
          )
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.deleteUser),
      mergeMap(({ userId }) =>
        this.authService.deleteUser(userId).pipe(
          map(() => AuthActions.deleteUserSuccess()),
          catchError((error) =>
            of(
              AuthActions.deleteUserFailure({
                error: error.error?.message || error.message || 'Failed to delete user account.',
              })
            )
          )
        )
      )
    )
  );
  
  deleteUserSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.deleteUserSuccess),
        tap(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.router.navigate(['/auth/register']); 
        })
      ),
    { dispatch: false }
  );

   oauthLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.oauthLogin),
      mergeMap(({ provider, code }) =>
        this.authService.oauthLogin(provider, code).pipe(
          map((response) =>
            AuthActions.oauthLoginSuccess({
              user: response.user,
              token: response.token,
            })
          ),
          catchError((error) =>
            of(
              AuthActions.oauthLoginFailure({
                error: error.message || 'OAuth login failed',
              })
            )
          )
        )
      )
    )
  );

  oauthLoginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.oauthLoginSuccess),
        tap(({ user, token }) => {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          this.router.navigate(['/']);
        })
      ),
    { dispatch: false }
  );
}  

