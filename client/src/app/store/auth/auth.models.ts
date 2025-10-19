import { User } from "../../core/models/user.model";

export interface AuthState {
    user : User | null,
    token : string | null,
    loading : boolean,
    error : string | null
}