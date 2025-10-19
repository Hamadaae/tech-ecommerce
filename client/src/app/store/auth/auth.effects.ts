import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../core/services/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffect {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((response) =>
            AuthActions.loginSuccess({ user: response.user, token: response.token })
          ),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.message || 'Login failed' }))
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
        map((user) => AuthActions.registerSuccess({ user, token: user.token || '' })),
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
