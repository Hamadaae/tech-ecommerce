import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from './product.models'; // Ensures we use the correct state model

// Selects the feature slice named 'products'
export const selectProductState = createFeatureSelector<ProductState>('products');

// Selects the products array
export const selectAllProducts = createSelector(
  selectProductState,
  (state) => state.products // Returns the Product[] array
);

// Selects the selected product object
export const selectSelectedProduct = createSelector(
  selectProductState,
  (state) => state.selectedProduct
);

// Selects the pagination meta object
export const selectProductsMeta = createSelector(
  selectProductState,
  (state) => state.meta
);

// Selects the loading boolean
export const selectProductsLoading = createSelector(
  selectProductState,
  (state) => state.loading
);

// Selects the error string
export const selectProductsError = createSelector(
  selectProductState,
  (state) => state.error
);
