import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { PaymentMethod, Order } from '../../core/models/order.model'; // ✅ تأكد من المسار الصحيح

@Component({
  selector: 'app-stripe-pay',
  standalone: true, // ⚡ مهم لو انت بتستخدم Angular standalone components
  imports: [CommonModule, HttpClientModule, FormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold mb-4">Pay with Card (Stripe)</h2>

      <div *ngIf="error" class="text-red-500">{{ error }}</div>

      <div *ngIf="clientSecret && !paid">
        <p>Client secret received. Integrate Stripe Elements on the page to complete payment.</p>
        <button (click)="simulatePayment()" class="px-4 py-2 rounded bg-teal-600 text-white mt-2">
          Simulate payment (demo)
        </button>
      </div>

      <div *ngIf="paid" class="text-green-600">Payment succeeded (simulated).</div>

      <div *ngIf="!clientSecret">
        <button (click)="createOrder()" class="px-4 py-2 rounded bg-blue-600 text-white">
          Create Order & Request Payment
        </button>
      </div>
    </div>
  `,
})
export class StripePay implements OnInit {
  clientSecret: string | null = null;
  error: string | null = null;
  paid = false;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {}

  createOrder() {
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
      shippingAddress: {
        address: 'Demo',
        city: 'Cairo',
        postalCode: '11511',
        country: 'Egypt',
      },
      paymentMethod: 'stripe' as PaymentMethod, // ✅ النوع مضبوط
      itemsPrice: 9.99,
      shippingPrice: 0,
      taxPrice: 0,
      totalPrice: 9.99,
    };

    this.orderService.createOrder(sampleOrder).subscribe({
      next: (res: any) => {
        this.clientSecret = res?.clientSecret || null;
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to create order';
      },
    });
  }

  // For demo — simulate Stripe payment success
  simulatePayment() {
    this.paid = true;
    // Optionally: call an API to mark the order as paid if needed
  }
}
