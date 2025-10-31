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
  selectedPriceRanges: Set<string> = new Set();
  selectedStockFilters: Set<'in_stock' | 'out_of_stock'> = new Set();

  priceRanges = [
    { label: '$0 - $1000', min: 0, max: 1000 },
    { label: '$1000 - $2000', min: 1000, max: 2000 },
    { label: '$2000+', min: 2000, max: undefined },
  ];

  stockOptions = [
    { label: 'In Stock', value: 'in_stock' as const },
    { label: 'Out of Stock', value: 'out_of_stock' as const },
  ];

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
    // Calculate price range filters
    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    
    if (this.selectedPriceRanges.size > 0) {
      const ranges = Array.from(this.selectedPriceRanges).map(key => {
        const range = this.priceRanges.find(r => `${r.min}-${r.max || 'inf'}` === key);
        return range;
      }).filter(Boolean) as typeof this.priceRanges;
      
      if (ranges.length > 0) {
        minPrice = Math.min(...ranges.map(r => r.min || 0));
        const maxValues = ranges.map(r => r.max).filter((v): v is number => v !== undefined);
        maxPrice = maxValues.length > 0 ? Math.max(...maxValues) : undefined;
      }
    }

    // Get stock filter (if multiple selected, use the first one, or combine logic)
    let stockFilter: 'in_stock' | 'out_of_stock' | undefined;
    if (this.selectedStockFilters.size === 1) {
      stockFilter = Array.from(this.selectedStockFilters)[0];
    } else if (this.selectedStockFilters.size === 2) {
      // If both selected, don't filter by stock
      stockFilter = undefined;
    }

    this.store.dispatch(
      ProductActions.loadProducts({
        page,
        limit,
        search,
        category: this.selectedCategory || undefined,
        sort: this.selectedSort || undefined,
        minPrice,
        maxPrice,
        stock: stockFilter,
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
    this.selectedPriceRanges.clear();
    this.selectedStockFilters.clear();
    const currentSearch = this.route.snapshot.queryParamMap.get('search') || '';
    this.loadProducts(1, this.defaultLimit, currentSearch);
  }

  togglePriceRange(range: { label: string; min: number; max?: number }): void {
    const key = `${range.min}-${range.max || 'inf'}`;
    if (this.selectedPriceRanges.has(key)) {
      this.selectedPriceRanges.delete(key);
    } else {
      this.selectedPriceRanges.add(key);
    }
    const currentSearch = this.route.snapshot.queryParamMap.get('search') || '';
    this.loadProducts(1, this.defaultLimit, currentSearch);
  }

  toggleStockFilter(stock: 'in_stock' | 'out_of_stock'): void {
    if (this.selectedStockFilters.has(stock)) {
      this.selectedStockFilters.delete(stock);
    } else {
      this.selectedStockFilters.add(stock);
    }
    const currentSearch = this.route.snapshot.queryParamMap.get('search') || '';
    this.loadProducts(1, this.defaultLimit, currentSearch);
  }

  isPriceRangeSelected(range: { label: string; min: number; max?: number }): boolean {
    const key = `${range.min}-${range.max || 'inf'}`;
    return this.selectedPriceRanges.has(key);
  }

  isStockFilterSelected(stock: 'in_stock' | 'out_of_stock'): boolean {
    return this.selectedStockFilters.has(stock);
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
