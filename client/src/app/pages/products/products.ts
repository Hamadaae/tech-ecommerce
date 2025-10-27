// products.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import * as ProductActions from '../../store/products/product.actions';
import * as ProductSelectors from '../../store/products/product.selectors';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { OrderItem } from '../../core/models/order.model';
import { PaginationMeta } from '../../store/products/product.models';
import { take } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products.html',
})
export class ProductsComponent implements OnInit {
  private store = inject(Store<AppState>);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);

  products$ = this.store.select(ProductSelectors.selectAllProducts);
  meta$ = this.store.select(ProductSelectors.selectProductsMeta);
  loading$ = this.store.select(ProductSelectors.selectProductsLoading);
  error$ = this.store.select(ProductSelectors.selectProductsError);

  categories: string[] = ['smartphones', 'mobile-accessories', 'laptops', 'tablets'];
  selectedCategory: string | null = null;
  selectedSort: string = '';

  private defaultLimit = 8;

  ngOnInit(): void {
    // react to search query param (debounced)
    this.route.queryParamMap
      .pipe(
        map(params => params.get('search') || ''),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.loadProducts(1, this.defaultLimit, searchTerm);
      });

    // initial load
    const initialSearch = this.route.snapshot.queryParamMap.get('search') || '';
    this.loadProducts(1, this.defaultLimit, initialSearch);
  }

  private loadProducts(page: number, limit: number, search?: string): void {
    this.store.dispatch(
      ProductActions.loadProducts({
        page,
        limit,
        search,
        category: this.selectedCategory || undefined,
        sort: this.selectedSort || undefined,
      })
    );
  }

  // filter helpers
  filterByCategory(category: string): void {
    if (this.selectedCategory === category) {
      // toggle off if clicking same
      this.selectedCategory = null;
    } else {
      this.selectedCategory = category;
    }
    // reload page 1 with chosen filter
    const currentSearch = this.route.snapshot.queryParamMap.get('search') || '';
    this.loadProducts(1, this.defaultLimit, currentSearch);
  }

  clearCategoryFilter(): void {
    this.selectedCategory = null;
    const currentSearch = this.route.snapshot.queryParamMap.get('search') || '';
    this.loadProducts(1, this.defaultLimit, currentSearch);
  }

  // sort change (value example: 'price:asc' or 'rating:desc')
onSortChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  const raw = target.value || ''; // e.g. "price-asc" or "rating-desc" or ""
  // map hyphen to colon so backend receives "price:asc" form
  const normalized = raw.includes('-') ? raw.replace('-', ':') : raw;
  this.selectedSort = normalized; // e.g. "price:asc"

  const currentSearch = this.route.snapshot.queryParamMap.get('search') || '';
  this.loadProducts(1, this.defaultLimit, currentSearch);
}

  // pagination: preserve current limit and search
  changePage(page: number): void {
    this.meta$.pipe(take(1)).subscribe(meta => {
      const currentLimit = meta ? meta.limit : this.defaultLimit;
      const currentSearch = this.route.snapshot.queryParamMap.get('search') || '';
      this.loadProducts(page, currentLimit, currentSearch);
    });
  }

  // price helper
  getFinalPrice(product: Product): number | undefined {
    if (product.price && product.discountPercentage) {
      return Math.round(product.price * (1 - product.discountPercentage / 100) * 100) / 100;
    }
    return product.price;
  }

  addToCart(product: Product): void {
    if (!product._id || product.price == null || !product.title) {
      console.error('Cannot add product to cart: missing ID, price, or title.');
      return;
    }

    const finalPrice = this.getFinalPrice(product) ?? product.price ?? 0;
    const cartItem: OrderItem = {
      product: product._id!,
      name: product.title!,
      price: finalPrice,
      quantity: 1,
      image: product.thumbnail,
      discountPercentage: product.discountPercentage,
    };

    this.cartService.addItem(cartItem);
    console.log(`Added ${product.title} to cart.`);
  }

  trackByProductId(index: number, product: any): string | number {
    return product?._id ?? product?.id ?? index;
  }
}
