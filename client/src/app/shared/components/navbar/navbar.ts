import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { isLoggedIn, selectUser } from '../../../store/auth/auth.selectors';
import { logout } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatSidenavModule,
    MatDividerModule,
  ],
  templateUrl: './navbar.html',
})
export class Navbar {

  isLoggedIn$: Observable<boolean>;
  user$: Observable<any>;
  cartItemCount = 0;
  showMobileSearch = false;
  searchQuery = '';

  constructor(private store: Store) {
    this.isLoggedIn$ = this.store.select(isLoggedIn);
    this.user$ = this.store.select(selectUser);
  }

  toggleMobileSearch() {
    this.showMobileSearch = !this.showMobileSearch;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
    }
  }

  logout() {
    this.store.dispatch(logout());
  }
}
