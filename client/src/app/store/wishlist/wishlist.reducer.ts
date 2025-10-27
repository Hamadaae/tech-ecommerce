import { createReducer, on } from '@ngrx/store';
import * as WishlistActions from './wishlist.actions';
import { Product } from '../../core/models/product.model';

export interface WishlistState {
  products: Product[];
}

export const initialState: WishlistState = {
  products: [],
};

export const wishlistReducer = createReducer(
  initialState,

  // 1. Load state from local storage on successful initialization
  on(WishlistActions.initWishlistSuccess, (state, { products }) => ({
    ...state,
    products,
  })),

  // 2. Add or remove product
  on(WishlistActions.toggleWishlistProduct, (state, { product }) => {
    // Check if the product is already present using its unique identifier
    const isPresent = state.products.some(p => p._id === product._id);

    if (isPresent) {
      // Remove product by filtering it out
      const updatedProducts = state.products.filter(p => p._id !== product._id);
      return {
        ...state,
        products: updatedProducts,
      };
    } else {
      // Add product
      const updatedProducts = [...state.products, product];
      return {
        ...state,
        products: updatedProducts,
      };
    }
  }),
);
