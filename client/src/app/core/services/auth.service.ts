import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, LoginPayload, RegisterPayload ,UserUpdatePayload } from '../models/user.model';

export interface AuthResponse {
  user: User;
  token: string;
}

const AUTH_API = '/api/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient); 

  register(data: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_API}/register`, data);
  }

  login(data: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_API}/login`, data);
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${AUTH_API}/me`);
  }

  updateUser(userId : string , data: UserUpdatePayload): Observable<User> {
    return this.http.put<User>(`${AUTH_API}/users/${userId}`, data);
  }

  deleteUser(userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${AUTH_API}/users/${userId}`);
  }

}
