// import { Component, OnInit } from '@angular/core';
// import { OrderService } from '../../core/services/order.service';
// import { CommonModule } from '@angular/common';
// import { HttpClientModule } from '@angular/common/http';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-admin',
//   templateUrl: './admin.html',
//   imports: [CommonModule, HttpClientModule, FormsModule],
//   styleUrls: ['./admin.css'],
// })
// export class Admin implements OnInit {
//   orders: any[] = [];
//   loading = false;
//   error: string | null = null;
//   statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

//   constructor(private orderService: OrderService) {}

//   ngOnInit(): void {
//     this.loadOrders();
//   }

//   loadOrders(): void {
//     this.loading = true;
//     this.orderService.getAllOrders().subscribe({
//       next: (res: any) => {
//         this.orders = res;
//         this.loading = false;
//       },
//       error: (err: any) => {
//         this.error = err?.error?.message || 'Failed to load orders';
//         this.loading = false;
//       },
//     });
//   }

//   updateStatus(orderId: string, status: string) {
//     this.orderService.updateOrderStatus(orderId, status).subscribe({
//       next: () => this.loadOrders(),
//       error: (err: any) => {
//         this.error = err?.error?.message || 'Failed to update status';
//       },
//     });
//   }
//   onStatusChange(id: string, event: Event) {
//     const value = (event.target as HTMLSelectElement).value;
//     this.updateStatus(id, value);
//   }

//   deleteOrder(orderId: string) {
//     if (!confirm('Delete order ' + orderId + '?')) return;
//     this.orderService.deleteOrder(orderId).subscribe({
//       next: () => this.loadOrders(),
//       error: (err: any) => {
//         this.error = err?.error?.message || 'Failed to delete order';
//       },
//     });
//   }
// }
