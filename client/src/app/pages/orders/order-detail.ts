import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule, HttpClientModule, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error" class="text-red-500">{{ error }}</div>
      <div *ngIf="order">
        <h1 class="text-2xl font-bold mb-4">Order {{ order._id }}</h1>
        <p><strong>User:</strong> {{ order.user?.email || order.user?.name }}</p>
        <p><strong>Status:</strong> {{ order.status }}</p>
        <p><strong>Payment:</strong> {{ order.paymentStatus }} - {{ order.paymentMethod }}</p>
        <h3 class="mt-4 font-semibold">Items</h3>
        <ul>
          <li *ngFor="let item of order.orderItems">
            {{ item.name }} — {{ item.quantity }} x {{ item.price }} = {{ (item.quantity * item.price) | number:'1.2-2' }}
          </li>
        </ul>
        <p class="mt-4"><strong>Total:</strong> {{ order.totalPrice }}</p>
        <button (click)="goBack()" class="mt-4 px-4 py-2 rounded bg-gray-200">Back</button>
      </div>
    </div>
  `,
})
export class OrderDetail implements OnInit {
  order: any = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(id);
    } else {
      this.error = 'No order id provided';
    }
  }

  

  loadOrder(id: string) {
    this.loading = true;
    this.orderService.getOrderById(id).subscribe({
      next: (res: any) => {
        this.order = res;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to load order';
        this.loading = false;
      },
    });
  }

  goBack() {
    this.location.back();
  }
}
