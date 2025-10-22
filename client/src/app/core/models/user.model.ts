export interface User {
  _id?: string;
  name?: string;
  email?: string;
  password?: string;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
  role: 'user' | 'admin';
}

export interface LoginPayload {
    email : string,
    password : string
}

export interface RegisterPayload {
    name : string,
    email : string,
    password : string
}

export interface UserUpdatePayload {
    name? : string,
    email? : string,
    password? : string
}