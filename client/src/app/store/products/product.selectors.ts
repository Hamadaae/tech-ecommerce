import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from './product.models'; // Ensures we use the correct state model

export const selectProductState = createFeatureSelector<ProductState>('products');

export const selectAllProducts = createSelector(
  selectProductState,
  (state) => state.products
);

export const selectSelectedProduct = createSelector(
  selectProductState,
  (state) => state.selectedProduct
);

export const selectProductsMeta = createSelector(
  selectProductState,
  (state) => state.meta
);

export const selectProductsLoading = createSelector(
  selectProductState,
  (state) => state.loading
);

export const selectProductsError = createSelector(
  selectProductState,
  (state) => state.error
);
