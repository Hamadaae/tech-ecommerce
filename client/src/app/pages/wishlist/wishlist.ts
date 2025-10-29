import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { WishlistService, WishlistItem } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { OrderItem } from '../../core/models/order.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, DecimalPipe],
  templateUrl: './wishlist.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Wishlist implements OnInit, OnDestroy {
  private wishlistService = inject(WishlistService);
  private cartService = inject(CartService);

  // unsubscribe function returned by onChange
  private unsubscribeFromWishlist: (() => void) | null = null;

  // signal holds WishlistItem[] (not OrderItem[])
  wishlistItems = signal<WishlistItem[]>([]);

  ngOnInit(): void {
    // subscribe to changes
    this.unsubscribeFromWishlist = this.wishlistService.onChange(() => {
      this.updateWishlistState();
    });

    // initial load
    this.updateWishlistState();
  }

  private updateWishlistState(): void {
    // getItems returns WishlistItem[], matches the signal type
    this.wishlistItems.set(this.wishlistService.getItems());
  }

  // remove a wishlist item
  removeItem(productId: string): void {
    this.wishlistService.removeItem(productId);
  }

  // clear wishlist
  clearWishlist(): void {
    this.wishlistService.clear();
  }

  // convert WishlistItem -> OrderItem and add to cart; then remove from wishlist
  addToCart(item: WishlistItem): void {
    if (!item?.product) return;

    const cartItem: OrderItem = {
      product: item.product,
      name: item.name || 'Unnamed Product',
      price: item.price ?? 0,
      quantity: 1, // cart requires quantity
      image: item.image,
      // keep discountPercentage optional if your OrderItem model has it
      // discountPercentage: undefined
    };

    this.cartService.addItem(cartItem);
  
  }

  ngOnDestroy(): void {
    if (this.unsubscribeFromWishlist) {
      this.unsubscribeFromWishlist();
    }
  }

  trackByProductId(index: number, item: WishlistItem): string {
    return item.product;
  }
}
