import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule , RouterModule],
  templateUrl: './products.html',
})
export class ProductsComponent {
  products = [
    { id: 1, name: 'Wireless Headphones', price: 99.99 },
    { id: 2, name: 'Smart Watch', price: 149.99 },
    { id: 3, name: 'Bluetooth Speaker', price: 59.99 }
  ];
}
