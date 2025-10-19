import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { User, LoginPayload, RegisterPayload } from "../models/user.model";

@Injectable({
    providedIn: 'root'
})

export class AuthService{
    private apiUrl = '/api/auth'

    constructor(private http: HttpClient){}

    register(data : RegisterPayload): Observable<User>{
        return this.http.post<User>(`${this.apiUrl}/register`, data)
    }

    login(data : LoginPayload): Observable<{token : string, user : User}>{
        return this.http.post<{token : string, user : User}>(`${this.apiUrl}/login`, data).pipe(
            tap(response => {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            })
        )
    }

    getMe(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`, {
            headers : {
                Authorization : `Bearer ${localStorage.getItem('token') || ''}`
            }
        })
    }

    logout(): void {
        localStorage.removeItem('token')
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token')
    }

}