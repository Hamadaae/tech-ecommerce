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

  on(WishlistActions.initWishlistSuccess, (state, { products }) => ({
    ...state,
    products,
  })),

  on(WishlistActions.toggleWishlistProduct, (state, { product }) => {
    const isPresent = state.products.some(p => p._id === product._id);

    if (isPresent) {
      const updatedProducts = state.products.filter(p => p._id !== product._id);
      return {
        ...state,
        products: updatedProducts,
      };
    } else {
      const updatedProducts = [...state.products, product];
      return {
        ...state,
        products: updatedProducts,
      };
    }
  }),
);
