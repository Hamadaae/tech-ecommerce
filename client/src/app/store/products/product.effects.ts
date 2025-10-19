import { Injectable, inject } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import * as ProductActions from './product.actions';
import { ProductService } from '../../core/services/product.service';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class ProductEffects {
  private actions$ = inject(Actions);
  private productService = inject(ProductService);

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      mergeMap(action =>
        this.productService.list({
          page: action.page,
          limit: action.limit,
          category: action.category,
          q: action.q
        }).pipe(
          map(res => ProductActions.loadProductsSuccess({ data: res.data, total: res.total })),
          catchError(err => of(ProductActions.loadProductsFailure({ error: err })))
        )
      )
    )
  );

  loadProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProduct),
      mergeMap(action =>
        this.productService.getById(action.id).pipe(
          map(product => ProductActions.loadProductSuccess({ product })),
          catchError(err => of(ProductActions.loadProductFailure({ error: err })))
        )
      )
    )
  );
}
