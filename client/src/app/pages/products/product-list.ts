// // src/app/pages/products/product-list.ts
// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, RouterModule } from '@angular/router';
// import { Store } from '@ngrx/store';
// import { Observable, combineLatest, of } from 'rxjs';
// import { map, switchMap, tap } from 'rxjs/operators';

// import { Product } from '../../core/models/product.model';
// import * as ProductActions from '../../store/products/product.actions';
// import { selectProductList, selectProductLoading } from '../../store/products/product.selectors';
// import { ProductCardComponent } from '../../shared/components/productCard/productCard';
// import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
// import { CurrencyPipe } from '../../shared/pipes/currency.pipe';

// @Component({
//   selector: 'app-product-list',
//   standalone: true,
//   imports: [CommonModule, RouterModule, ProductCardComponent, TruncatePipe, CurrencyPipe],
//   template: `
//     <div class="min-h-screen bg-gray-50 py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//       <h1 class="text-3xl font-bold mb-6">Products</h1>

//       <!-- Loading -->
//       <div *ngIf="loading$ | async" class="text-center py-6 text-gray-500">
//         Loading products…
//       </div>

//       <!-- Product grid -->
//       <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" *ngIf="!(loading$ | async)">
//         <app-product-card *ngFor="let product of products$ | async" [product]="product"></app-product-card>
//       </div>

//       <!-- Empty state -->
//       <div *ngIf="(products$ | async)?.length === 0 && !(loading$ | async)" class="text-center py-6 text-gray-500">
//         No products found.
//       </div>

//     </div>
//   `
// })
// export class ProductListComponent implements OnInit {
//   private store = inject(Store);
//   private route = inject(ActivatedRoute);

//   products$!: Observable<Product[]>;
//   loading$!: Observable<boolean>;

//   ngOnInit(): void {
//     this.loading$ = this.store.select(selectProductLoading);

//     // Subscribe to query params for category/search
//     this.products$ = this.route.queryParamMap.pipe(
//       switchMap(params => {
//         const category = params.get('category') || undefined;
//         const q = params.get('q') || undefined;

//         // Dispatch loadProducts with filters
//         this.store.dispatch(ProductActions.loadProducts({ page: 1, limit: 50, category, q }));

//         // Select list from store
//         return this.store.select(selectProductList);
//       }),
//       map(list => list || [])
//     );
//   }
// }
