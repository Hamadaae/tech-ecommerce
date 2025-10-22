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
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';
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
  private cartSub?: () => void;
  private subs = new Subscription();

  constructor(private store: Store, private cartService: CartService, private notificationService: NotificationService) {
    this.isLoggedIn$ = this.store.select(isLoggedIn);
    this.user$ = this.store.select(selectUser);
    // initialize & subscribe to cart
    this.cartItemCount = this.cartService.getCount();
    this.cartSub = this.cartService.onChange(() => {
      this.cartItemCount = this.cartService.getCount();
    });
    // log notifications for now
    this.subs.add(this.notificationService.notifications$.subscribe(n => console.log('Notification:', n)));
  }
  ngOnDestroy() {
    if (this.cartSub) this.cartSub();
    this.subs.unsubscribe();
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
