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
import { MatIconModule } from '@angular/material/icon';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './products.html',
})
export class ProductsComponent implements OnInit {
  private store = inject(Store<AppState>);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private wishlistService = inject(WishlistService);

  products$ = this.store.select(ProductSelectors.selectAllProducts);
  meta$ = this.store.select(ProductSelectors.selectProductsMeta);
  loading$ = this.store.select(ProductSelectors.selectProductsLoading);
  error$ = this.store.select(ProductSelectors.selectProductsError);

  categories: string[] = ['smartphones', 'mobile-accessories', 'laptops', 'tablets'];
  selectedCategory: string | null = null;
  selectedSort: string = '';

  private defaultLimit = 8;

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(map(params => params.get('search') || ''), debounceTime(300), distinctUntilChanged())
      .subscribe(searchTerm => {
        this.loadProducts(1, this.defaultLimit, searchTerm);
      });

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

  filterByCategory(category: string): void {
    if (this.selectedCategory === category) {
      this.selectedCategory = null;
    } else {
      this.selectedCategory = category;
    }
    const currentSearch = this.route.snapshot.queryParamMap.get('search') || '';
    this.loadProducts(1, this.defaultLimit, currentSearch);
  }

  clearCategoryFilter(): void {
    this.selectedCategory = null;
    const currentSearch = this.route.snapshot.queryParamMap.get('search') || '';
    this.loadProducts(1, this.defaultLimit, currentSearch);
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const raw = target.value || '';
    const normalized = raw.includes('-') ? raw.replace('-', ':') : raw;
    this.selectedSort = normalized;
    const currentSearch = this.route.snapshot.queryParamMap.get('search') || '';
    this.loadProducts(1, this.defaultLimit, currentSearch);
  }

  changePage(page: number): void {
    this.meta$.pipe(take(1)).subscribe(meta => {
      const currentLimit = meta ? meta.limit : this.defaultLimit;
      const currentSearch = this.route.snapshot.queryParamMap.get('search') || '';
      this.loadProducts(page, currentLimit, currentSearch);
    });
  }

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

  // ✅ Wishlist logic (added)
  toggleWishlist(product: Product): void {
    if (!product?._id) return;

    if (this.wishlistService.isInWishlist(product._id)) {
      this.wishlistService.removeItem(product._id);
    } else {
      this.wishlistService.addItem({
        product: product._id,
        name: product.title ?? 'Unnamed Product',
        price: this.getFinalPrice(product) ?? product.price ?? 0,
        image: product.thumbnail,
      });
    }
  }

  isInWishlist(product: Product): boolean {
    return !!product?._id && this.wishlistService.isInWishlist(product._id);
  }
}
