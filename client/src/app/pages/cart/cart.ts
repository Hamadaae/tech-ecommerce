import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, DecimalPipe, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderItem } from '../../core/models/order.model';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { PaymentMethod, Order } from '../../core/models/order.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, RouterModule, NgIf, NgForOf],
  templateUrl: './cart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
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

  checkoutCOD(): void {
    const orderItems = this.cartService.getItems();
    if (!orderItems.length) return;

    const itemsPrice = Math.round(this.cartService.getTotal() * 100) / 100;
    const shippingPrice = 0;
    const taxPrice = 0;
    const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

    const orderData: Partial<Order> = {
      orderItems,
      shippingAddress: {
        address: 'Demo',
        city: 'Cairo',
        postalCode: '11511',
        country: 'Egypt',
      },
      paymentMethod: 'cash_on_delivery' as PaymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    };

    this.orderService.createOrder(orderData).subscribe({
      next: async (res: any) => {
        try { await this.cartService.clear(); } catch {}
        const id = res?.order?._id;
        if (id) this.router.navigate(['/orders', id]);
      },
      error: (err: any) => {
        console.error('Failed to create COD order', err);
      },
    });
  }

  checkoutStripe(): void {
    const orderItems = this.cartService.getItems();
    if (!orderItems.length) return;

    const itemsPrice = Math.round(this.cartService.getTotal() * 100) / 100;
    const shippingPrice = 0;
    const taxPrice = 0;
    const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

    const orderData: Partial<Order> = {
      orderItems,
      shippingAddress: {
        address: 'Demo',
        city: 'Cairo',
        postalCode: '11511',
        country: 'Egypt',
      },
      paymentMethod: 'stripe' as PaymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (res: any) => {
        const checkoutUrl = res?.checkoutUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        }
      },
      error: (err: any) => {
        console.error('Failed to create Stripe order', err);
      },
    });
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
