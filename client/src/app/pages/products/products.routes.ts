import { Routes } from '@angular/router';

export const productsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./products').then(m => m.ProductsComponent)
  }
];
