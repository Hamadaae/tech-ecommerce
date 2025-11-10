import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class Admin implements OnInit {
  orders: any[] = [];
  products: any[] = [];
  newProduct: any = { title: '', price: 0, stock: 0, category: '', description: '' };
  loading = false;
  error: string | null = null;

  constructor(private orderService: OrderService, private productService: ProductService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadProducts();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (res: any) => {
        // API returns { data, meta }
        this.orders = res?.data || [];
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to load orders';
        this.loading = false;
      },
    });
  }

  updateStatus(orderId: string, isDelivered: boolean) {
    this.orderService.updateOrderStatus(orderId, isDelivered).subscribe({
      next: () => this.loadOrders(),
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to update status';
      },
    });
  }

  onStatusChange(id: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.updateStatus(id, checked);
  }

  deleteOrder(orderId: string) {
    if (!confirm('Delete order ' + orderId + '?')) return;
    this.orderService.deleteOrder(orderId).subscribe({
      next: () => this.loadOrders(),
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to delete order';
      },
    });
  }

  markOrderPaid(orderId: string) {
    if (!confirm('Mark order ' + orderId + ' as paid?')) return;
    this.orderService.updateOrderToPaid(orderId, null).subscribe({
      next: () => this.loadOrders(),
      error: (err: any) => (this.error = err?.error?.message || 'Failed to mark paid'),
    });
  }

  /* Products management */
  loadProducts(page = 1, limit = 50) {
    this.productService.getProducts(page, limit).subscribe({
      next: (res: any) => {
        this.products = res?.data || [];
      },
      error: (err: any) => (this.error = err?.error?.message || 'Failed to load products'),
    });
  }

  addProduct() {
    const payload = { ...this.newProduct };
    this.productService.createProduct(payload).subscribe({
      next: (p: any) => {
        this.newProduct = { title: '', price: 0, stock: 0, category: '', description: '' };
        this.loadProducts();
      },
      error: (err: any) => (this.error = err?.error?.message || 'Failed to add product'),
    });
  }

  deleteProduct(productId: string) {
    if (!confirm('Delete product ' + productId + '?')) return;
    this.productService.deleteProduct(productId).subscribe({
      next: () => this.loadProducts(),
      error: (err: any) => (this.error = err?.error?.message || 'Failed to delete product'),
    });
  }
}
