import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import * as ProductActions from '../../store/products/product.actions';
import * as ProductSelectors from '../../store/products/product.selectors';
import { Product, Review } from '../../core/models/product.model';
import { switchMap, tap } from 'rxjs/operators';
import { CartService } from '../../core/services/cart.service';
import { OrderItem } from '../../core/models/order.model';
import { of } from 'rxjs';

@Component({
  selector: 'app-product-details',
  standalone: true,
  // CommonModule and RouterModule are sufficient for template directives and routerLink
  imports: [CommonModule, RouterModule],
  templateUrl: './product-details.html',
})
export class ProductDetailsComponent implements OnInit {
  private store = inject(Store<AppState>);
  private route = inject(ActivatedRoute);
  private cartService = inject(CartService);

  public product$ = this.store.select(ProductSelectors.selectSelectedProduct);
  public loading$ = this.store.select(ProductSelectors.selectProductsLoading);
  public error$ = this.store.select(ProductSelectors.selectProductsError);

  // hoveredImage holds URL of the thumbnail user is hovering; null => show main/default
  public hoveredImage: string | null = null;

  // helper used by template to set/clear hover image
  public setHoverImage(url: string | null): void {
    this.hoveredImage = url;
  }

  ngOnInit(): void {
    // subscribe to paramMap and dispatch load action when id is present
    this.route.paramMap
      .pipe(
        tap(params => {
          const productId = params.get('id');
          if (productId) this.store.dispatch(ProductActions.loadProduct({ id: productId }));
        }),
        // return a completed observable so pipe ends cleanly
        switchMap(() => of(null))
      )
      .subscribe();
  }

  getFinalPrice(product: Product | null | undefined): number | undefined {
    if (!product) return undefined;
    if (product.price && product.discountPercentage) {
      return Math.round(product.price * (1 - product.discountPercentage / 100) * 100) / 100;
    }
    return product.price;
  }

  addToCart(product: Product): void {
    if (!product._id || !product.price || !product.title) {
      console.error('Cannot add product to cart: missing ID, price, or title.');
      return;
    }

    const finalPrice = this.getFinalPrice(product) || product.price;

    const cartItem: OrderItem = {
      product: product._id,
      name: product.title,
      price: finalPrice,
      quantity: 1,
      image: product.thumbnail,
      discountPercentage: product.discountPercentage,
    };

    this.cartService.addItem(cartItem);
    console.log(`Added ${product.title} to cart.`);
  }
}
