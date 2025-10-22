import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WishlistState } from './wishlist.reducer';
import { Product } from '../../core/models/product.model'; // Assuming location

export const selectWishlistState = createFeatureSelector<WishlistState>('wishlist');

/**
 * Selects the entire array of products in the wishlist.
 */
export const selectAllWishlistProducts = createSelector(
  selectWishlistState,
  (state) => state.products
);

/**
 * Selects the total number of items in the wishlist.
 */
export const selectWishlistCount = createSelector(
  selectAllWishlistProducts,
  (products) => products.length
);

/**
 * Factory selector that checks if a product with a given ID is currently in the wishlist.
 * Use as: store.select(selectIsProductInWishlist(productId)).
 */
export const selectIsProductInWishlist = (id: string) => createSelector(
  selectAllWishlistProducts,
  (products: Product[]) => products.some(p => p._id === id)
);
