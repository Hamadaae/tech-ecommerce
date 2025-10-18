import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
  ],
  templateUrl: './navbar.html',
})
export class Navbar {
  isLoggedIn = false; // Change to true when user is logged in
  cartItemCount = 0; // number of items in cart

  constructor() {
    // TODO: replace with real cart service subscription
    this.cartItemCount = 0; // default, update dynamically in real app
  }

  logout() {
    this.isLoggedIn = false;
  }
}
