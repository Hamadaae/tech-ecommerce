import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { Wishlist } from './pages/wishlist/wishlist';

export const routes: Routes = [
  { path: '', component: Home }, 
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { 
    path: 'products',
    loadChildren: () => import('./pages/products/products.routes').then(m => m.routes)
  },
  { 
    path: 'orders',
    loadChildren: () => import('./pages/orders/orders.routes').then(m => m.routes),
    // TODO: Add route guard for authentication
  },
  {
    path: 'wishlist',
    component: Wishlist,
    // TODO: Add route guard for authentication
  },
  { path: '**', redirectTo: '' }, 
<<<<<<< HEAD
];
=======
];
>>>>>>> 11877cdcb930414417e10a13849971c84ac583c6
