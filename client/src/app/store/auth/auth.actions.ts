import { createAction, props } from "@ngrx/store";
import { User, LoginPayload, RegisterPayload, UserUpdatePayload } from "../../core/models/user.model";

export const login = createAction(
    '[Auth] Login',
    props<{credentials : LoginPayload}>()
)

export const loginSuccess = createAction(
    '[Auth] Login Success',
    props<{user : User , token : string}>()
)

export const loginFailure = createAction(
    '[Auth] Login Failure',
    props<{error : string}>()
)

export const logout = createAction(
    '[Auth] Logout'
)

export const register = createAction(
  '[Auth] Register',
  props<{ data: RegisterPayload }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: User; token: string }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

export const updateUser = createAction(
    '[Auth] Update User Profile',
    props<{ userId: string, data: UserUpdatePayload }>()
);

export const updateUserSuccess = createAction(
    '[Auth] Update User Profile Success',
    props<{ user: User }>()
);

export const updateUserFailure = createAction(
    '[Auth] Update User Profile Failure',
    props<{ error: string }>()
);

export const deleteUser = createAction(
    '[Auth] Delete User Account',
    props<{ userId: string }>()
);

export const deleteUserSuccess = createAction(
    '[Auth] Delete User Account Success'
);

export const deleteUserFailure = createAction(
    '[Auth] Delete User Account Failure',
    props<{ error: string }>()
);

export const oauthLogin = createAction(
  '[Auth] OAuth Login',
  props<{ provider: 'github' | 'discord'; code: string }>()
);

export const oauthLoginSuccess = createAction(
  '[Auth] OAuth Login Success',
  props<{ user: User; token: string }>()
);

export const oauthLoginFailure = createAction(
  '[Auth] OAuth Login Failure',
  props<{ error: string }>()
);


export const loadUserFromStorage = createAction('[Auth] Load User From Storage');

