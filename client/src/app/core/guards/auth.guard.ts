import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('token');

    // if (token) return true;
    // return this.router.parseUrl('/auth/login');

    const user = localStorage.getItem('user');
    if (!token || !user) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const parsedUser = JSON.parse(user);

    if (this.router.url.includes('/admin') && parsedUser.role !== 'admin') {
      this.router.navigate(['/']);
      return false;
    }

    return true;

  }
}
