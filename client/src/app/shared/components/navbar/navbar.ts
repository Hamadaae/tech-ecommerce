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
  isLoggedIn = false; // Change to true when user is logged in
  cartItemCount = 0; // number of items in cart
  showMobileSearch = false;
  searchQuery = '';
  isAnimating = false;

  constructor() {
    // TODO: replace with real cart service subscription
    this.cartItemCount = 0; // default, update dynamically in real app
  }

  toggleMobileSearch() {
    this.isAnimating = true;
    this.showMobileSearch = !this.showMobileSearch;
    
    // Reset animation state after transition
    setTimeout(() => {
      this.isAnimating = false;
    }, 300); // Match this with the duration in the CSS transition
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      // TODO: Implement search logic
      console.log('Searching for:', this.searchQuery);
    }
  }

  logout() {
    // TODO: Implement real logout logic
    this.isLoggedIn = false;
  }
}
