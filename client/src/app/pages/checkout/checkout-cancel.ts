import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-checkout-cancel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-6">
      <h2 class="text-2xl font-bold mb-2">Payment canceled</h2>
      <p class="mb-4">Your payment was canceled. You can try again or review your cart.</p>
      <button (click)="cancelOrder()" class="mb-4 px-3 py-1 rounded bg-red-600 text-white">Cancel Order</button>
      <div class="space-x-3">
        <a class="underline text-blue-600" routerLink="/cart">Go to Cart</a>
        <a class="underline text-blue-600" routerLink="/checkout/pay">Try Again</a>
        <a class="underline text-blue-600" routerLink="/">Home</a>
      </div>
    </div>
  `,
})
export class CheckoutCancel {
  constructor(private route: ActivatedRoute, private orderService: OrderService) {
    this.cancelOrder();
  }

  cancelOrder() {
    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    if (!orderId) return;
    this.orderService.cancelUnpaidOrder(orderId).subscribe({
      next: () => {},
      error: () => {},
    });
  }
}


