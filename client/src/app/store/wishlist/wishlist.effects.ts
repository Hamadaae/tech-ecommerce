import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as WishlistActions from './wishlist.actions';
import { selectAllWishlistProducts } from './wishlist.selectors';
import { map, withLatestFrom, tap } from 'rxjs/operators';
import { Product } from '../../core/models/product.model';

// Key for local storage
const WISHLIST_KEY = 'ecomm_wishlist';

@Injectable()
export class WishlistEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);

  // 1. Effect to initialize the wishlist from local storage on app start
  initWishlist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WishlistActions.initWishlist),
      map(() => {
        try {
          const storedData = localStorage.getItem(WISHLIST_KEY);
          // Parse the JSON data or default to an empty array if null
          const products: Product[] = storedData ? JSON.parse(storedData) : [];
          return WishlistActions.initWishlistSuccess({ products });
        } catch (error) {
          console.error('Error loading wishlist from localStorage', error);
          // Always dispatch success to continue app flow, even if with an empty array
          return WishlistActions.initWishlistSuccess({ products: [] });
        }
      })
    )
  );

  // 2. Effect to persist the state to local storage whenever a product is toggled
  persistWishlist$ = createEffect(
    () =>
      this.actions$.pipe(
        // Listen to the action that caused the state change
        ofType(WishlistActions.toggleWishlistProduct),
        // Get the latest state *after* the reducer has run
        withLatestFrom(this.store.select(selectAllWishlistProducts)),
        // Perform the side effect (writing to local storage)
        tap(([action, currentProducts]) => {
          try {
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(currentProducts));
          } catch (error) {
            console.error('Error saving wishlist to localStorage', error);
            // Error here won't block the UI, but it won't persist
          }
        })
      ),
    { dispatch: false } // This effect only handles a side-effect and does not dispatch a new action
  );
}
