import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../core/services/order.service';
import { Router } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.html',
  imports: [CommonModule, HttpClientModule, FormsModule, DatePipe],

  styleUrls: ['./orders.css'],
})
export class Orders implements OnInit {
  orders: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;
    this.orderService.getMyOrders().subscribe({
      next: (res: any) => {
        this.orders = res;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to load orders';
        this.loading = false;
      },
    });
  }

  openOrder(orderId: string) {
    this.router.navigate(['/orders', orderId]);
  }
}
