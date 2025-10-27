import { createAction, props } from '@ngrx/store';
import { Product } from '../../core/models/product.model';

<<<<<<< HEAD
// --- READ Operations ---

export const loadProducts = createAction(
  '[Product] Load Products',
  props<{ page?: number; limit?: number; category?: string; search?: string, sort ?: string }>()
);
=======
export const loadProducts = createAction('[Products] Load Products');
>>>>>>> 12d7094c63bfa985490eec18dded0e157d1120e5

export const loadProductsSuccess = createAction(
  '[Product] Load Products Success',
  props<{ products: Product[]; meta: any }>()
);

export const loadProductsFailure = createAction(
  '[Product] Load Products Failure',
  props<{ error: string }>()
);

export const loadProduct = createAction(
  '[Products] Load Product',
  props<{ id: string }>()
);

export const loadProductSuccess = createAction(
  '[Products] Load Product Success',
  props<{ product: Product }>()
);

export const loadProductFailure = createAction(
  '[Products] Load Product Failure',
  props<{ error: string }>()
);

export const createProduct = createAction(
  '[Products] Create Product',
  props<{ product: Omit<Product, '_id'> }>() 
);

export const createProductSuccess = createAction(
  '[Products] Create Product Success',
  props<{ product: Product }>()
);

export const createProductFailure = createAction(
  '[Products] Create Product Failure',
  props<{ error: string }>()
);

export const updateProduct = createAction(
  '[Products] Update Product',
  props<{ id: string; changes: Partial<Product> }>()
);

export const updateProductSuccess = createAction(
  '[Products] Update Product Success',
  props<{ product: Product }>()
);

export const updateProductFailure = createAction(
  '[Products] Update Product Failure',
  props<{ error: string }>()
);

export const deleteProduct = createAction(
  '[Products] Delete Product',
  props<{ id: string }>()
);

export const deleteProductSuccess = createAction(
  '[Products] Delete Product Success',
  props<{ id: string }>()
);

export const deleteProductFailure = createAction(
  '[Products] Delete Product Failure',
  props<{ error: string }>()
);
