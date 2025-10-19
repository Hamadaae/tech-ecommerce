import { createReducer, on } from '@ngrx/store';
import * as ProductActions from './product.actions';
import { Product } from '../../core/models/product.model';

export const productFeatureKey = 'products';

export interface ProductState {
  list: Product[];
  selected: Product | null;
  loading: boolean;
  total: number;
  lastQuery?: any;
}

export const initialState: ProductState = {
  list: [],
  selected: null,
  loading: false,
  total: 0,
  lastQuery: null
};

export const productReducer = createReducer(
  initialState,
  on(ProductActions.loadProducts, (state, action) => ({
    ...state,
    loading: true,
    lastQuery: action
  })),
  on(ProductActions.loadProductsSuccess, (state, action) => ({
    ...state,
    loading: false,
    list: action.data,
    total: action.total
  })),
  on(ProductActions.loadProductsFailure, state => ({
    ...state,
    loading: false
  })),
  on(ProductActions.loadProduct, state => ({
    ...state,
    loading: true
  })),
  on(ProductActions.loadProductSuccess, (state, action) => ({
    ...state,
    loading: false,
    selected: action.product
  })),
  on(ProductActions.loadProductFailure, state => ({
    ...state,
    loading: false
  }))
);
