import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderItem } from '../../core/models/order.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, RouterModule],
  templateUrl: './cart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private unsubscribeFromCart: (() => void) | null = null;

  // Signals to hold cart state for reactivity
  cartItems = signal<OrderItem[]>([]);
  cartTotal = signal<number>(0);

  ngOnInit(): void {
    // Subscribe to cart changes from the service
    this.unsubscribeFromCart = this.cartService.onChange(() => {
      this.updateCartState();
    });
    // Initialize state immediately
    this.updateCartState();
  }

  /**
   * Fetches the latest items and total from the CartService and updates the signals.
   */
  private updateCartState(): void {
    this.cartItems.set(this.cartService.getItems());
    this.cartTotal.set(this.cartService.getTotal());
  }

  /**
   * Handles quantity change input from the user.
   */
  onQuantityChange(item: OrderItem, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newQuantity = parseInt(inputElement.value, 10);

    // Only update if quantity is a valid number >= 1
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      this.cartService.updateItemQuantity(item.product, newQuantity);
    }
  }

  /**
   * Removes an item from the cart.
   */
  removeItem(productId: string): void {
    this.cartService.removeItem(productId);
  }

  /**
   * Clears all items from the cart.
   */
  clearCart(): void {
    this.cartService.clear();
  }

  ngOnDestroy(): void {
    // Clean up the subscription when the component is destroyed
    if (this.unsubscribeFromCart) {
      this.unsubscribeFromCart();
    }
  }

  /**
   * Tracks cart items by product ID for better performance with ngFor.
   */
  trackByProductId(index: number, item: OrderItem): string {
    return item.product;
  }
}
