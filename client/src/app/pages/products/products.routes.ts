import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./products').then(m => m.Products)
  },
  {
    path: ':id',
    loadComponent: () => import('./product-detail').then(m => m.ProductDetail)
  }
];