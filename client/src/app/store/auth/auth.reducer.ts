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
  }),

  on(AuthActions.register, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.registerSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    error: null,
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),


   on(AuthActions.updateUser, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.updateUserSuccess, (state, { user }) => {
    localStorage.setItem('user', JSON.stringify(user)); 
    return {
      ...state,
      loading: false,
      error: null,
    };
  }),
  on(AuthActions.updateUserFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(AuthActions.deleteUser, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.deleteUserSuccess, () => {
    return initialState; 
  }),
  on(AuthActions.deleteUserFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(AuthActions.oauthLogin, (state) => ({
  ...state,
  loading: true,
  error: null,
})),
on(AuthActions.oauthLoginSuccess, (state, { user, token }) => ({
  ...state,
  loading: false,
  user,
  token,
  error: null,
})),
on(AuthActions.oauthLoginFailure, (state, { error }) => ({
  ...state,
  loading: false,
  error,
})),
);


