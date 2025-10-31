import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';

import { isLoggedIn, selectUser } from '../../../store/auth/auth.selectors';
import { logout } from '../../../store/auth/auth.actions';

// Services
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { NotificationService } from '../../../core/services/notification.service';

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
export class Navbar implements OnDestroy {
  isLoggedIn$: Observable<boolean>;
  user$: Observable<any>;
  cartItemCount = 0;
  wishlistItemCount = 0; // ✅ Added property for wishlist count
  searchTerm = '';
  showMobileSearch = false;

  private subs = new Subscription();
  private cartUnsubscribe?: () => void;
  private wishlistUnsubscribe?: () => void; // ✅ Added unsubscribe for wishlist

  constructor(
    private store: Store,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService, // ✅ Injected wishlist service
    private notificationService: NotificationService
  ) {
    this.isLoggedIn$ = this.store.select(isLoggedIn);
    this.user$ = this.store.select(selectUser);

    this.cartItemCount = this.cartService.getCount();
    this.cartUnsubscribe = this.cartService.onChange(() => {
      this.cartItemCount = this.cartService.getCount();
    });

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 271fbaa2c1667b76edecd72b1da5b8b50548d8fa
=======
>>>>>>> cd75363 (Payment Stuff)
    // ✅ Initialize and subscribe to wishlist count updates
    this.wishlistItemCount = this.wishlistService.getCount();
    this.wishlistUnsubscribe = this.wishlistService.onChange(() => {
      this.wishlistItemCount = this.wishlistService.getCount();
    });

    // Optional: subscribe to notifications
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 8203b84d7852e56a9599e1771a2a40d3e5eb4c86
=======
>>>>>>> 271fbaa2c1667b76edecd72b1da5b8b50548d8fa
=======
>>>>>>> cd75363 (Payment Stuff)
    this.subs.add(
      this.notificationService.notifications$.subscribe((n) =>
        console.log('Notification:', n)
      )
    );
  }

  ngOnDestroy(): void {
    if (this.cartUnsubscribe) this.cartUnsubscribe();
    if (this.wishlistUnsubscribe) this.wishlistUnsubscribe(); // ✅ cleanup
    this.subs.unsubscribe();
  }

  toggleMobileSearch(): void {
    this.showMobileSearch = !this.showMobileSearch;
  }

  onSearch(): void {
    const query = this.searchTerm.trim();
    if (query) {
      this.router.navigate(['/products'], { queryParams: { search: query } });
      this.showMobileSearch = false;
    }
  }

  logout(): void {
    this.store.dispatch(logout());
  }
}
