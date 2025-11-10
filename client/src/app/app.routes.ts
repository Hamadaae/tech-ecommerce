import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthLoading } from './store/auth/auth.selectors';
import { filter, map } from 'rxjs/operators';
import { productsRoutes } from './pages/products/products.routes';
import { OAuthCallbackComponent } from './pages/auth/oauth-callback';

const isAppReadyGuard = () => {
  const store = inject(Store);

  return store.select(selectAuthLoading).pipe(
    filter((isLoading) => !isLoading),
    map(() => true)
  );
};

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    canActivate: [isAppReadyGuard],
  },
  {
    path: 'checkout',
    canActivate: [isAppReadyGuard, AuthGuard],
    children: [
      {
        path: 'pay',
        loadComponent: () => import('./pages/checkout/stripe-pay').then((m) => m.StripePay),
      },
      {
        path: 'success',
        loadComponent: () =>
          import('./pages/checkout/checkout-success').then((m) => m.CheckoutSuccess),
      },
      {
        path: 'cancel',
        loadComponent: () =>
          import('./pages/checkout/checkout-cancel').then((m) => m.CheckoutCancel),
      },
      {
        path: '',
        redirectTo: 'pay',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./pages/wishlist/wishlist').then((m) => m.Wishlist),
    canActivate: [isAppReadyGuard, AuthGuard],
  },
  {
    path: 'products',
    children: productsRoutes,
    canActivate: [isAppReadyGuard],
  },
  {
    path: 'orders',
    loadChildren: () => import('./pages/orders/orders.routes').then((m) => m.routes),
    canActivate: [isAppReadyGuard, AuthGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
    canActivate: [isAppReadyGuard, AuthGuard],
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
    canActivate: [isAppReadyGuard, AuthGuard],
  },
  {
    path: 'contactus',
    loadComponent: () => import('./pages/contactus/contactus').then((m) => m.Contactus),
    canActivate: [isAppReadyGuard],
  },
  {
    path: 'auth',
    canActivate: [isAppReadyGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register').then((m) => m.Register),
      },
      {
        path: 'discord/callback',
        component: OAuthCallbackComponent,
        data: { provider: 'discord' },
      },
      {
        path: 'github/callback',
        component: OAuthCallbackComponent,
        data: { provider: 'github' },
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
    canActivate: [isAppReadyGuard, AuthGuard],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
