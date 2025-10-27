import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';

// Store selectors/actions
import { isLoggedIn, selectUser } from '../../../store/auth/auth.selectors';
import { logout } from '../../../store/auth/auth.actions';

// Services
import { CartService } from '../../../core/services/cart.service';
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
  searchTerm = '';
  showMobileSearch = false;

  private subs = new Subscription();
  private cartUnsubscribe?: () => void;

  constructor(
    private store: Store,
    private router: Router,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {
    this.isLoggedIn$ = this.store.select(isLoggedIn);
    this.user$ = this.store.select(selectUser);

    // Initialize and subscribe to cart count updates
    this.cartItemCount = this.cartService.getCount();
    this.cartUnsubscribe = this.cartService.onChange(() => {
      this.cartItemCount = this.cartService.getCount();
    });

    // Optional: subscribe to notifications
    this.subs.add(
      this.notificationService.notifications$.subscribe((n) =>
        console.log('Notification:', n)
      )
    );
  }

  ngOnDestroy(): void {
    if (this.cartUnsubscribe) this.cartUnsubscribe();
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
