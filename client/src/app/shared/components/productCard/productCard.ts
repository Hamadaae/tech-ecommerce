import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a [routerLink]="['/products', product._id]"
       class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col">
      <img [src]="product.images?.[0] || 'assets/placeholder.png'"
           [alt]="product.title"
           class="w-full h-48 object-contain mb-4 rounded">
      <h3 class="font-medium text-lg mb-1">{{ product.title }}</h3>
      <p class="text-gray-700 mb-2">$ {{ product.price }}</p>
      <p class="text-sm text-gray-500 truncate">{{ product.description }}</p>
    </a>
  `
})
export class ProductCardComponent {
  @Input() product!: Product;
}
