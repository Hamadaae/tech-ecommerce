import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, LoginPayload, RegisterPayload, UserUpdatePayload } from '../models/user.model';
import { environment } from '../../../environments/environment';
export interface AuthResponse {
  user: User;
  token: string;
}

const AUTH_API = '/api/auth';
const OAUTH_API = '/api/oauth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  register(data: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_API}/register`, data);
  }

  login(data: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_API}/login`, data);
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${AUTH_API}/me`, {
      headers: this.getAuthHeaders(),
    });
  }

  updateUser(userId: string, data: UserUpdatePayload): Observable<User> {
    return this.http.put<User>(`${AUTH_API}/users/${userId}`, data);
  }

  deleteUser(userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${AUTH_API}/users/${userId}`);
  }

oauthLogin(provider: 'discord' | 'github', code: string): Observable<AuthResponse> {
  return this.http.get<AuthResponse>(`${AUTH_API}/${provider}/callback?code=${code}`);
}

getOAuthLoginUrl(provider: 'discord' | 'github'): string {
  const baseUrls = {
    discord: `https://discord.com/oauth2/authorize`,
    github: `https://github.com/login/oauth/authorize`,
  };

  const clientIds = {
    discord: environment.discordClientId,
    github: environment.githubClientId,
  };

  const redirectUris = {
    discord: encodeURIComponent('http://localhost:4200/auth/discord/callback'),
    github: encodeURIComponent('http://localhost:4200/auth/github/callback'),
  };

  const scopes = {
    discord: 'identify email',
    github: 'user:email',
  };

  const responseType = 'code';

  return `${baseUrls[provider]}?client_id=${clientIds[provider]}&redirect_uri=${redirectUris[provider]}&response_type=${responseType}&scope=${scopes[provider]}`;
}
}
