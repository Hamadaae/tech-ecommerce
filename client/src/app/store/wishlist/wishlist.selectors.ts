import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WishlistState } from './wishlist.reducer';
import { Product } from '../../core/models/product.model'; // Assuming location

export const selectWishlistState = createFeatureSelector<WishlistState>('wishlist');


export const selectAllWishlistProducts = createSelector(
  selectWishlistState,
  (state) => state.products
);

export const selectWishlistCount = createSelector(
  selectAllWishlistProducts,
  (products) => products.length
);

export const selectIsProductInWishlist = (id: string) => createSelector(
  selectAllWishlistProducts,
  (products: Product[]) => products.some(p => p._id === id)
);
