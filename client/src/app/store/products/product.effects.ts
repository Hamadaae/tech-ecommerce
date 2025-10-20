import { Injectable, inject } from '@angular/core'; // <-- Import inject
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as ProductActions from './product.actions';
import { ProductService } from '../../core/services/product.service';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class ProductEffects {
  // Use inject() to pull dependencies directly, guaranteeing they are defined
  private actions$ = inject(Actions);
  private productService = inject(ProductService);

  // The constructor is now clean (and can be removed) as dependencies are injected above.
  constructor() {} 

  // ✅ Load all products
  loadProducts$ = createEffect(() =>
    // 'this.actions$' is now guaranteed to be defined
    this.actions$.pipe( 
      ofType(ProductActions.loadProducts),
      mergeMap(() =>
        this.productService.getProducts().pipe(
          map((products) => ProductActions.loadProductsSuccess({ products })),
          catchError((error) =>
            of(ProductActions.loadProductsFailure({ error: error.message || 'Failed to load products' }))
          )
        )
      )
    )
  );

  // ✅ Load single product by ID
  loadProduct$ = createEffect(() =>
    // 'this.actions$' is now guaranteed to be defined
    this.actions$.pipe(
      ofType(ProductActions.loadProduct),
      mergeMap(({ id }) =>
        this.productService.getProductById(id).pipe(
          map((product) => ProductActions.loadProductSuccess({ product })),
          catchError((error) =>
            of(ProductActions.loadProductFailure({ error: error.message || 'Failed to load product' }))
          )
        )
      )
    )
  );
}
