import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState, productFeatureKey } from './product.reducer';

export const selectProductState = createFeatureSelector<ProductState>(productFeatureKey);

export const selectProductList = createSelector(
  selectProductState,
  state => state.list
);

export const selectProductLoading = createSelector(
  selectProductState,
  state => state.loading
);

export const selectSelectedProduct = createSelector(
  selectProductState,
  state => state.selected
);
