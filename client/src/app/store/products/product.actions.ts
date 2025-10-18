import { createAction, props } from '@ngrx/store';
import { Product } from '../../core/models/product.model';

// Load multiple products
export const loadProducts = createAction(
  '[Product] Load Products',
  props<{ page: number; limit: number; category?: string; q?: string }>()
);

export const loadProductsSuccess = createAction(
  '[Product] Load Products Success',
  props<{ data: Product[]; total: number }>()
);

export const loadProductsFailure = createAction(
  '[Product] Load Products Failure',
  props<{ error: any }>()
);

// Load single product
export const loadProduct = createAction(
  '[Product] Load Product',
  props<{ id: string }>()
);

export const loadProductSuccess = createAction(
  '[Product] Load Product Success',
  props<{ product: Product }>()
);

export const loadProductFailure = createAction(
  '[Product] Load Product Failure',
  props<{ error: any }>()
);
