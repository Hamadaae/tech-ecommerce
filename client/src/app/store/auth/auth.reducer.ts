import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AuthState } from './auth.models';

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,

  on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),

  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(AuthActions.logout, () => initialState),

  on(AuthActions.loadUserFromStorage, (state) => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return {
      ...state,
      token: token || null,
      user: user ? JSON.parse(user) : null,
    };
  })
);
