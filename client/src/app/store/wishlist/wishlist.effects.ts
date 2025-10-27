import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as WishlistActions from './wishlist.actions';
import { selectAllWishlistProducts } from './wishlist.selectors';
import { map, withLatestFrom, tap } from 'rxjs/operators';
import { Product } from '../../core/models/product.model';

const WISHLIST_KEY = 'ecomm_wishlist';

@Injectable()
export class WishlistEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);

  initWishlist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WishlistActions.initWishlist),
      map(() => {
        try {
          const storedData = localStorage.getItem(WISHLIST_KEY);
          const products: Product[] = storedData ? JSON.parse(storedData) : [];
          return WishlistActions.initWishlistSuccess({ products });
        } catch (error) {
          console.error('Error loading wishlist from localStorage', error);
          return WishlistActions.initWishlistSuccess({ products: [] });
        }
      })
    )
  );

  persistWishlist$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(WishlistActions.toggleWishlistProduct),
        withLatestFrom(this.store.select(selectAllWishlistProducts)),
        tap(([action, currentProducts]) => {
          try {
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(currentProducts));
          } catch (error) {
            console.error('Error saving wishlist to localStorage', error);
          }
        })
      ),
    { dispatch: false }
  );
}
