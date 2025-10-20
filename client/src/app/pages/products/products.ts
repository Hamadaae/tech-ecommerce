import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import * as ProductActions from '../../store/products/product.actions';
import * as ProductSelectors from '../../store/products/product.selectors';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { OrderItem } from '../../core/models/order.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products.html',
})
export class ProductsComponent implements OnInit {
  private store = inject(Store<AppState>);
  private cartService = inject(CartService);

  products$ = this.store.select(ProductSelectors.selectAllProducts);
  loading$ = this.store.select(ProductSelectors.selectProductsLoading);
  error$ = this.store.select(ProductSelectors.selectProductsError);

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
  }

  getFinalPrice(product: Product): number | undefined {
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
