// src/app/pages/products/product-details.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Product } from '../../core/models/product.model';
import * as ProductActions from '../../store/products/product.actions';
import { selectSelectedProduct, selectProductLoading } from '../../store/products/product.selectors';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, TruncatePipe, CurrencyPipe],
  template: `
    <div *ngIf="loading$ | async" class="py-10 text-center">Loading…</div>

    <ng-container *ngIf="product$ | async as product">
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 py-10">

        <!-- Images -->
        <div class="bg-white rounded-lg p-6">
          <img
            [src]="(product.images && product.images.length) ? product.images[0] : 'assets/placeholder.png'"
            [alt]="product.title"
            class="w-full h-96 object-contain"
          />
          <div class="grid grid-cols-4 gap-2 mt-4">
            <img *ngFor="let img of (product.images || [])" [src]="img"
                 class="h-20 object-cover rounded cursor-pointer"/>
          </div>
        </div>

        <!-- Product Info -->
        <div>
          <h1 class="text-3xl font-bold">{{ product.title }}</h1>
          <p class="text-2xl font-semibold mt-4">{{ product.price }}</p>
          <p class="mt-4 text-gray-700">{{ product.description  }}</p>

          <div class="mt-6">
            <label class="block mb-2">Quantity</label>
            <input type="number" min="1" [value]="1" class="w-24 border rounded px-2 py-1" />
          </div>

          <div class="mt-6 flex gap-3">
            <button class="px-6 py-3 bg-blue-600 text-white rounded-lg">Add to Cart</button>
            <button class="px-6 py-3 border rounded-lg">Wishlist</button>
          </div>
        </div>

      </div>
    </ng-container>
  `
})
export class ProductDetailsComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);

  product$!: Observable<Product | null>;
  loading$!: Observable<boolean>;

  ngOnInit(): void {
    this.loading$ = this.store.select(selectProductLoading);

    this.product$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) return of(null);

        // Dispatch action to load a single product
        this.store.dispatch(ProductActions.loadProduct({ id }));

        // Select product from store
        return this.store.select(selectSelectedProduct);
      })
    );
  }
}
