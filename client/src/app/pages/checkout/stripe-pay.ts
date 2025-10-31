import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { CartService } from '../../core/services/cart.service';
import { PaymentMethod, Order } from '../../core/models/order.model'; 

@Component({
  selector: 'app-stripe-pay',
  standalone: true, 
  imports: [CommonModule, HttpClientModule, FormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold mb-4">Pay with Card (Stripe)</h2>

      <div *ngIf="error" class="text-red-500">{{ error }}</div>

      <div *ngIf="!checkoutUrl">
        <button (click)="createOrder()" class="px-4 py-2 rounded bg-blue-600 text-white">
          Create Order & Request Payment
        </button>
      </div>
      <div *ngIf="checkoutUrl">
        <p>Redirecting to Stripe Checkout...</p>
      </div>
    </div>
  `,
})
export class StripePay implements OnInit {
  checkoutSessionId: string | null = null;
  checkoutUrl: string | null = null;
  error: string | null = null;

  constructor(private orderService: OrderService, private cartService: CartService) {}

  ngOnInit(): void {}

  createOrder() {
    const cartItems = this.cartService.getItems();
    const itemsPrice = Math.round(this.cartService.getTotal() * 100) / 100;
    const shippingPrice = 0;
    const taxPrice = 0;
    const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

    const sampleOrder: Partial<Order> = {
      orderItems: cartItems,
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

    this.orderService.createOrder(sampleOrder).subscribe({
      next: (res: any) => {
        this.checkoutSessionId = res?.checkoutSessionId || null;
        this.checkoutUrl = res?.checkoutUrl || null;
        if (this.checkoutUrl) {
          window.location.href = this.checkoutUrl;
        }
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to create order';
      },
    });
  }   
}
