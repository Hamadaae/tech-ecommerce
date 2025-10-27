import { createAction, props } from '@ngrx/store';
import { Product } from '../../core/models/product.model'; // Assuming location

// --- Initial Load from Local Storage ---

/**
 * Dispatched on application startup (e.g., in the App Component's ngOnInit)
 * to initiate the load from local storage.
 */
export const initWishlist = createAction('[Wishlist] Initialize Wishlist');

/**
 * Dispatched by the effect once the data is retrieved from local storage.
 */
export const initWishlistSuccess = createAction(
  '[Wishlist] Initialize Wishlist Success',
  props<{ products: Product[] }>()
);

// --- Core Logic & Persistence Trigger ---

/**
 * Dispatched by a component when a user clicks a "heart" or "add to wishlist" button.
 * The reducer handles the state change (add/remove), and the effect handles persistence.
 */
export const toggleWishlistProduct = createAction(
  '[Wishlist] Toggle Product',
  props<{ product: Product }>()
);
