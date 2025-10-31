import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { OrderService } from '../../core/services/order.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  template: `
    <div class="container mx-auto p-6">
      <h2 class="text-2xl font-bold mb-4">Finalizing your order...</h2>
      <div *ngIf="error" class="text-red-600 mb-4">{{ error }}</div>
      <div *ngIf="message" class="text-green-600 mb-4">{{ message }}</div>
      <div class="space-x-3" *ngIf="orderId">
        <a class="underline text-blue-600" [routerLink]="['/orders', orderId]">View Order</a>
        <a class="underline text-blue-600" routerLink="/orders">My Orders</a>
        <a class="underline text-blue-600" routerLink="/">Home</a>
      </div>
    </div>
  `,
})
export class CheckoutSuccess implements OnInit {
  orderId: string | null = null;
  sessionId: string | null = null;
  error: string | null = null;
  message: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private orderService: OrderService, private cartService: CartService) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (!this.orderId || !this.sessionId) {
      this.error = 'Missing order or session details.';
      return;
    }

    // First, check if the order is already paid (webhook might have already processed it)
    this.orderService.getOrderById(this.orderId).subscribe({
      next: async (order) => {
        // If order is already paid, clear cart immediately
        if (order.isPaid && order.paymentStatus === 'paid') {
          console.log('Order already paid via webhook:', order);
          this.message = 'Payment confirmed! Your order has been processed.';
          await this.cartService.clear();
          return;
        }

        // If not paid yet, try to update it
        this.orderService.updateOrderToPaid(this.orderId!, this.sessionId!).subscribe({
          next: async (updatedOrder) => {
            console.log('Order payment confirmed:', updatedOrder);
            this.message = 'Payment confirmed and order marked as paid.';
            await this.cartService.clear();
          },
          error: (err) => {
            console.error('Failed to confirm payment:', err);
            // Check again if order was paid by webhook while we were waiting
            this.orderService.getOrderById(this.orderId!).subscribe({
              next: async (recheckOrder) => {
                if (recheckOrder.isPaid && recheckOrder.paymentStatus === 'paid') {
                  this.message = 'Payment confirmed! Your order has been processed.';
                  await this.cartService.clear();
                } else {
                  this.error = err?.error?.message || 'Failed to finalize order payment.';
                }
              },
              error: () => {
                this.error = err?.error?.message || 'Failed to finalize order payment.';
              },
            });
          },
        });
      },
      error: (err) => {
        console.error('Failed to load order:', err);
        // Try to update anyway in case order exists
        this.orderService.updateOrderToPaid(this.orderId!, this.sessionId!).subscribe({
          next: async (order) => {
            console.log('Order payment confirmed:', order);
            this.message = 'Payment confirmed and order marked as paid.';
            await this.cartService.clear();
          },
          error: (updateErr) => {
            console.error('Failed to confirm payment:', updateErr);
            this.error = updateErr?.error?.message || 'Failed to finalize order payment.';
          },
        });
      },
    });
  }
}


