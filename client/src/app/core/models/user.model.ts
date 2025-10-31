export interface User {
  _id?: string;
  name?: string;
  email?: string;
  password?: string;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
  role?: 'user' | 'admin';
  provider?: 'local' | 'github' | 'discord';
  providerId?: string;
  avatar?: string;
  isOAuth?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UserUpdatePayload {
  name?: string;
  email?: string;
  password?: string;
}
