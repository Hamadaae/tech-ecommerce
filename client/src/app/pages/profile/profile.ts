import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectUser } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html'
})
export class Profile {
  user$: Observable<any>;
  sidebar = [
    { label: 'Account Dashboard', route: '/profile' },
    { label: 'Account Information', route: '/profile/info' },
    { label: 'Address Book', route: '/profile/addresses' },
    { label: 'My Orders', route: '/orders' },
    { label: 'My Wish List', route: '/wishlist' }
  ];

  constructor(private store: Store, private router: Router) {
    this.user$ = this.store.select(selectUser);
  }

  goTo(route: string) {
    this.router.navigateByUrl(route);
  }
}
