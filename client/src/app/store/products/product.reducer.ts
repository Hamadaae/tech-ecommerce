import { createReducer, on } from '@ngrx/store';
import * as ProductActions from './product.actions';
// Import ProductState and initialState from the models file to ensure one source of truth
import { initialState, ProductState } from './product.models'; 
import { Product } from '../../core/models/product.model';

export const productReducer = createReducer(
  initialState,

  on(ProductActions.loadProducts, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(ProductActions.loadProductsSuccess, (state, { products, meta }) => ({
    ...state,
    loading: false,
    products, // Assigns the Product[] array from the payload
    meta: meta, // Assigns the PaginationMeta object from the payload
  })),

  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ProductActions.loadProduct, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProductActions.loadProductSuccess, (state, { product }) => ({
    ...state,
    selectedProduct: product,
    loading: false,
  })),
  on(ProductActions.loadProductFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ProductActions.createProduct, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProductActions.createProductSuccess, (state, { product }) => ({
    ...state,
    products: [...state.products, product],
    loading: false,
  })),
  on(ProductActions.createProductFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ProductActions.updateProduct, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProductActions.updateProductSuccess, (state, { product }) => ({
    ...state,
    products: state.products.map(p => p._id === product._id ? product : p),
    loading: false,
  })),
  on(ProductActions.updateProductFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ProductActions.deleteProduct, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProductActions.deleteProductSuccess, (state, { id }) => ({
    ...state,
    products: state.products.filter(p => p._id !== id),
    loading: false,
    selectedProduct: state.selectedProduct?._id === id ? null : state.selectedProduct,
  })),
  on(ProductActions.deleteProductFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
