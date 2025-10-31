import { createAction, props } from '@ngrx/store';
import { Product } from '../../core/models/product.model'; // Assuming location

export const initWishlist = createAction('[Wishlist] Initialize Wishlist');


export const initWishlistSuccess = createAction(
  '[Wishlist] Initialize Wishlist Success',
  props<{ products: Product[] }>()
);

export const toggleWishlistProduct = createAction(
  '[Wishlist] Toggle Product',
  props<{ product: Product }>()
);
