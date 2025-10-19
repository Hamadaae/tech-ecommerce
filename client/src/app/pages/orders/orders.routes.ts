import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./orders').then((m) => m.Orders),
  },
  {
    path: ':id',
    loadComponent: () => import('./order-detail').then((m) => m.OrderDetail),
  },
];
