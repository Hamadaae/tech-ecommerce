import { createAction, props } from "@ngrx/store";
import { User, LoginPayload, RegisterPayload } from "../../core/models/user.model";

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



export const loadUserFromStorage = createAction('[Auth] Load User From Storage');