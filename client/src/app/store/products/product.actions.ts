import { createAction, props } from '@ngrx/store';
import { Product } from '../../core/models/product.model';

// --- READ Operations ---

export const loadProducts = createAction('[Products] Load Products');

export const loadProductsSuccess = createAction(
  '[Products] Load Products Success',
  props<{ products: Product[] }>()
);

export const loadProductsFailure = createAction(
  '[Products] Load Products Failure',
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

// --- CREATE Operation ---

export const createProduct = createAction(
  '[Products] Create Product',
  props<{ product: Omit<Product, '_id'> }>() // Omit _id as it's assigned by backend
);

export const createProductSuccess = createAction(
  '[Products] Create Product Success',
  props<{ product: Product }>() // Full product including the new _id
);

export const createProductFailure = createAction(
  '[Products] Create Product Failure',
  props<{ error: string }>()
);

// --- UPDATE Operation ---

export const updateProduct = createAction(
  '[Products] Update Product',
  props<{ id: string; changes: Partial<Product> }>()
);

export const updateProductSuccess = createAction(
  '[Products] Update Product Success',
  props<{ product: Product }>() // The fully updated product
);

export const updateProductFailure = createAction(
  '[Products] Update Product Failure',
  props<{ error: string }>()
);

// --- DELETE Operation ---

export const deleteProduct = createAction(
  '[Products] Delete Product',
  props<{ id: string }>()
);

export const deleteProductSuccess = createAction(
  '[Products] Delete Product Success',
  props<{ id: string }>() // Just the ID is needed to remove it from state
);

export const deleteProductFailure = createAction(
  '[Products] Delete Product Failure',
  props<{ error: string }>()
);
