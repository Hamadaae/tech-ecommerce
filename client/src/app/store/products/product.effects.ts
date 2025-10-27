import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as ProductActions from './product.actions';
import { ProductService } from '../../core/services/product.service';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';

@Injectable()
export class ProductEffects {
  private actions$ = inject(Actions);
  private productService = inject(ProductService);

  constructor() {} 

  // --- READ EFFECTS ---

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      mergeMap(({ page = 1, limit = 10, category, search, sort }) =>
        this.productService.getProducts(page, limit, category, search, sort).pipe(
          map((res) =>
            ProductActions.loadProductsSuccess({
              products: res.data,
              meta: res.meta,
            })
          ),
          catchError((error: any) =>
            of(
              ProductActions.loadProductsFailure({
                error:
                  error?.error?.message ||
                  error?.message ||
                  'Failed to load products',
              })
            )
          )
        )
      )
    )
  );

  loadProduct$ = createEffect(() =>
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

  // --- CREATE EFFECT ---

  createProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.createProduct),
      // switchMap is generally better for CUD operations to cancel previous requests
      switchMap(({ product }) =>
        this.productService.createProduct(product).pipe(
          map((newProduct) => ProductActions.createProductSuccess({ product: newProduct })),
          catchError((error) =>
            of(ProductActions.createProductFailure({ error: error.message || 'Failed to create product' }))
          )
        )
      )
    )
  );

  // --- UPDATE EFFECT ---

  updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.updateProduct),
      switchMap(({ id, changes }) =>
        this.productService.updateProduct(id, changes).pipe(
          // Assuming the backend returns the *fully* updated product
          map((updatedProduct) => ProductActions.updateProductSuccess({ product: updatedProduct })),
          catchError((error) =>
            of(ProductActions.updateProductFailure({ error: error.message || 'Failed to update product' }))
          )
        )
      )
    )
  );

  // --- DELETE EFFECT ---

  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.deleteProduct),
      switchMap(({ id }) =>
        this.productService.deleteProduct(id).pipe(
          // On successful deletion, we only need the ID to update the state
          map(() => ProductActions.deleteProductSuccess({ id })),
          catchError((error) =>
            of(ProductActions.deleteProductFailure({ error: error.message || 'Failed to delete product' }))
          )
        )
      )
    )
  );
}
