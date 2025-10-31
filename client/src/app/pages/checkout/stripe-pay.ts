import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
<<<<<<< HEAD
import { PaymentMethod, Order } from '../../core/models/order.model'; // ✅ تأكد من المسار الصحيح

@Component({
  selector: 'app-stripe-pay',
  standalone: true, // ⚡ مهم لو انت بتستخدم Angular standalone components
=======
import { CartService } from '../../core/services/cart.service';
import { PaymentMethod, Order } from '../../core/models/order.model'; 

@Component({
  selector: 'app-stripe-pay',
  standalone: true, 
>>>>>>> cd75363 (Payment Stuff)
  imports: [CommonModule, HttpClientModule, FormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold mb-4">Pay with Card (Stripe)</h2>

      <div *ngIf="error" class="text-red-500">{{ error }}</div>

<<<<<<< HEAD
      <div *ngIf="clientSecret && !paid">
        <p>Client secret received. Integrate Stripe Elements on the page to complete payment.</p>
        <button (click)="simulatePayment()" class="px-4 py-2 rounded bg-teal-600 text-white mt-2">
          Simulate payment (demo)
        </button>
      </div>

      <div *ngIf="paid" class="text-green-600">Payment succeeded (simulated).</div>

      <div *ngIf="!clientSecret">
=======
      <div *ngIf="!checkoutUrl">
>>>>>>> cd75363 (Payment Stuff)
        <button (click)="createOrder()" class="px-4 py-2 rounded bg-blue-600 text-white">
          Create Order & Request Payment
        </button>
      </div>
<<<<<<< HEAD
=======
      <div *ngIf="checkoutUrl">
        <p>Redirecting to Stripe Checkout...</p>
      </div>
>>>>>>> cd75363 (Payment Stuff)
    </div>
  `,
})
export class StripePay implements OnInit {
<<<<<<< HEAD
  clientSecret: string | null = null;
  error: string | null = null;
  paid = false;

  constructor(private orderService: OrderService) {}
=======
  checkoutSessionId: string | null = null;
  checkoutUrl: string | null = null;
  error: string | null = null;

  constructor(private orderService: OrderService, private cartService: CartService) {}
>>>>>>> cd75363 (Payment Stuff)

  ngOnInit(): void {}

  createOrder() {
<<<<<<< HEAD
    // ✅ استخدم نفس structure اللي معرفه في Order model
    const sampleOrder: Partial<Order> = {
      orderItems: [
        {
          product: '64f0d0d...fake',
          name: 'Demo product',
          quantity: 1,
          price: 9.99,
        },
      ],
=======
    const cartItems = this.cartService.getItems();
    const itemsPrice = Math.round(this.cartService.getTotal() * 100) / 100;
    const shippingPrice = 0;
    const taxPrice = 0;
    const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

    const sampleOrder: Partial<Order> = {
      orderItems: cartItems,
>>>>>>> cd75363 (Payment Stuff)
      shippingAddress: {
        address: 'Demo',
        city: 'Cairo',
        postalCode: '11511',
        country: 'Egypt',
      },
<<<<<<< HEAD
      paymentMethod: 'stripe' as PaymentMethod, // ✅ النوع مضبوط
      itemsPrice: 9.99,
      shippingPrice: 0,
      taxPrice: 0,
      totalPrice: 9.99,
=======
      paymentMethod: 'stripe' as PaymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
>>>>>>> cd75363 (Payment Stuff)
    };

    this.orderService.createOrder(sampleOrder).subscribe({
      next: (res: any) => {
<<<<<<< HEAD
        this.clientSecret = res?.clientSecret || null;
=======
        this.checkoutSessionId = res?.checkoutSessionId || null;
        this.checkoutUrl = res?.checkoutUrl || null;
        if (this.checkoutUrl) {
          window.location.href = this.checkoutUrl;
        }
>>>>>>> cd75363 (Payment Stuff)
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to create order';
      },
    });
<<<<<<< HEAD
  }

  // For demo — simulate Stripe payment success
  simulatePayment() {
    this.paid = true;
    // Optionally: call an API to mark the order as paid if needed
  }
=======
  }   
>>>>>>> cd75363 (Payment Stuff)
}
