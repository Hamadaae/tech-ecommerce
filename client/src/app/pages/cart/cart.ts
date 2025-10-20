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

  cartItems = signal<OrderItem[]>([]);
  cartTotal = signal<number>(0);

  ngOnInit(): void {
    this.unsubscribeFromCart = this.cartService.onChange(() => {
      this.updateCartState();
    });
    this.updateCartState();
  }

  private updateCartState(): void {
    this.cartItems.set(this.cartService.getItems());
    this.cartTotal.set(this.cartService.getTotal());
  }

  onQuantityChange(item: OrderItem, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newQuantity = parseInt(inputElement.value, 10);

    if (!isNaN(newQuantity) && newQuantity >= 1) {
      this.cartService.updateItemQuantity(item.product, newQuantity);
    }
  }

  removeItem(productId: string): void {
    this.cartService.removeItem(productId);
  }

  clearCart(): void {
    this.cartService.clear();
  }

  ngOnDestroy(): void {
    if (this.unsubscribeFromCart) {
      this.unsubscribeFromCart();
    }
  }

  trackByProductId(index: number, item: OrderItem): string {
    return item.product;
  }
}
