import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthLoading } from './store/auth/auth.selectors';
import { filter, map } from 'rxjs/operators';

const isAppReadyGuard = () => {
    const store = inject(Store);
    return store.select(selectAuthLoading).pipe(
        filter(isLoading => !isLoading), 
        map(() => true)
    );
};

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home').then(m => m.Home),
        canActivate: [isAppReadyGuard, AuthGuard]
    },
    {
        path: 'wishlist',
        loadComponent: () => import('./pages/wishlist/wishlist').then(m => m.Wishlist),
        canActivate: [isAppReadyGuard, AuthGuard]
    },
    {
        path: 'products',
        loadChildren: () => import('./pages/products/products.routes').then(m => m.productsRoutes),
        canActivate: [isAppReadyGuard, AuthGuard] 
    },
    { 
        path: 'orders',
        loadChildren: () => import('./pages/orders/orders.routes').then(m => m.routes),
        canActivate: [isAppReadyGuard, AuthGuard] 
    },
    {

        path: 'auth',
        canActivate: [isAppReadyGuard], 
        children: [
            {
                path: 'login',
                loadComponent: () => import('./pages/auth/login/login').then(m => m.Login),
            },
            {
                path: 'register',
                loadComponent: () => import('./pages/auth/register/register').then(m => m.Register),
            },
            { path: '', redirectTo: 'login', pathMatch: 'full' }
        ]
    },
    { 
        path: '**', 
        redirectTo: '', 
        pathMatch: 'full' 
    }
];
